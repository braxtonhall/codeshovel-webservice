package contollers;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ast.CompilationUnit;
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

import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;

public class ParseController {
    public static Collection<Object> getMethods(String path) {
        class Tuple {
            public String longName;
            public int startLine;
            public String methodName;

            Tuple(String longName, int startLine, String methodName) {
                this.longName = longName;
                this.startLine = startLine;
                this.methodName = methodName;
            }
        }

        Collection<Object> output = new ArrayList<>();

        try {
            new VoidVisitorAdapter<Object>() {
                @Override
                public void visit(MethodDeclaration md, Object arg) {
                    super.visit(md, arg);
                    output.add(new Tuple(
                            buildName(md),
                            md.getRange().isPresent() ? md.getRange().get().begin.line : 0,
                            md.getName().toString()
                    ));
                }
            }.visit(JavaParser.parse(Paths.get(path).toFile()), null);
            return output;
        } catch (IOException ioe) {
            System.out.println("ParseController::getMethods(..) - Error reading from disk " + ioe.toString());
            throw new InternalError("Was not able to read file from disk");
        }
    }

    private static String buildName(MethodDeclaration md) {
        StringBuilder parameters = new StringBuilder();
        StringBuilder parents = new StringBuilder();
        
        for(Parameter parameter:md.getParameters()) {
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
