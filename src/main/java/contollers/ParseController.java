package contollers;

import com.felixgrund.codeshovel.services.RepositoryService;
import com.felixgrund.codeshovel.services.impl.CachingRepositoryService;
import com.felixgrund.codeshovel.util.Utl;
import com.felixgrund.codeshovel.wrappers.Commit;
import com.github.javaparser.JavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.Modifier;
import com.github.javaparser.ast.Node;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.body.Parameter;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.ast.expr.ObjectCreationExpr;
import com.github.javaparser.ast.stmt.BlockStmt;
import com.github.javaparser.ast.stmt.ExpressionStmt;
import com.github.javaparser.ast.stmt.LocalClassDeclarationStmt;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.lib.Repository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;

public class ParseController {
    public static Collection<Object> getMethods(String repositoryPathGit,
                                                String repositoryName,
                                                String startCommitName,
                                                String filepath) {
        class MethodTransport {
            public String longName;
            public int startLine;
            public String methodName;
            public boolean isStatic;
            public boolean isAbstract;
            public String visibility;

            MethodTransport(
                    String longName,
                    int startLine,
                    String methodName,
                    boolean isStatic,
                    boolean isAbstract,
                    String visibility
            ) {
                this.longName = longName;
                this.startLine = startLine;
                this.methodName = methodName;
                this.isStatic = isStatic;
                this.isAbstract = isAbstract;
                this.visibility = visibility;
            }
        }

        Collection<Object> output = new ArrayList<>();
        try {
            Repository repository = Utl.createRepository(repositoryPathGit);
            Git git = new Git(repository);
            RepositoryService repositoryService = new CachingRepositoryService(git, repository, repositoryName, repositoryPathGit);
            Commit startCommit = repositoryService.findCommitByName(startCommitName);
            String startFileContent = repositoryService.findFileContent(startCommit, filepath);
            new VoidVisitorAdapter<Object>() {
                @Override
                public void visit(MethodDeclaration md, Object arg) {
                    super.visit(md, arg);
                    output.add(new MethodTransport(
                            buildName(md),
                            md.getName().getRange().isPresent() ? md.getName().getRange().get().begin.line : 0,
                            md.getName().toString(),
                            md.isStatic(),
                            md.isAbstract(),
                            Modifier.getAccessSpecifier(md.getModifiers()).asString()
                    ));
                }
            }.visit(JavaParser.parse(startFileContent), null);
            return output;
        } catch (IOException ioe) {
            System.out.println("ParseController::getMethods(..) - Error reading from disk " + ioe.toString());
            throw new InternalError("Was not able to read file from disk");
        }
    }

    private static String buildName(MethodDeclaration md) {
        StringBuilder parameters = new StringBuilder();
        StringBuilder parents = new StringBuilder();
        
        for(Parameter parameter:md.getParameters()) { // TODO include meta like final
            if(parameters.length() > 0) {
                parameters.append(", ");
            }
            parameters.append(parameter.getType());
            parameters.append(" ");
            parameters.append(parameter.getName());
        }

        class NodeVisitor extends VoidVisitorAdapter<Object> {
            public void visit(Node n, Object arg) {
                System.out.println("The following node was unaccounted for: " + n.toString());
            }

            @Override
            public void visit(MethodDeclaration md, Object arg) {
                parents.insert(0, md.getName());
                parents.insert(0, "::");
            }

            @Override
            public void visit(ClassOrInterfaceDeclaration coid, Object arg) {
                parents.insert(0, coid.getName());
                parents.insert(0, "$");
            }

            @Override
            public void visit(ObjectCreationExpr oce, Object arg) {
                parents.insert(0, oce.getType().getName());
                parents.insert(0, "$");
            }

            @Override
            public void visit(CompilationUnit cu, Object arg) {
                parents.deleteCharAt(0);
            }

            @Override
            public void visit(BlockStmt bs, Object arg) {}
            @Override
            public void visit(LocalClassDeclarationStmt lcds, Object arg) {}
            @Override
            public void visit(MethodCallExpr mce, Object arg) {}
            @Override
            public void visit(ExpressionStmt es, Object arg) {}
        }

        NodeVisitor v = new NodeVisitor();
        Node ancestor = md;
        while(ancestor.getParentNode().isPresent()) {
            ancestor = ancestor.getParentNode().get();
            ancestor.accept(v, null);
        }

        return parents.toString() + "::" + md.getName() + "(" + parameters.toString() + ")";
    }
}
