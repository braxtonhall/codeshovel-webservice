package contollers;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ast.Node;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.body.Parameter;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;

public class ParseController {
    public static Collection<Object> getMethods(String path) {
        class Tuple {
            public String method;
            public int startLine;

            Tuple(String method, int startLine) {
                this.method = method;
                this.startLine = startLine;
            }
        }

        Collection<Object> output = new ArrayList<Object>();

        try {
            new VoidVisitorAdapter<Object>() {
                @Override
                public void visit(MethodDeclaration n, Object arg) {
                    super.visit(n, arg);
                    StringBuilder parameters = new StringBuilder();
                    for(Parameter parameter:n.getParameters()) {
                        if(parameters.length() > 0) {
                            parameters.append(", ");
                        }
                        parameters.append(parameter.getType());
                        parameters.append(" ");
                        parameters.append(parameter.getName());
                    }
                    StringBuilder classes = new StringBuilder();
                    Node ancestor = n;
                    while(ancestor.getParentNode().isPresent()) {
                        ancestor = ancestor.getParentNode().get();
                        if (ancestor instanceof ClassOrInterfaceDeclaration) {// TODO this is TERRIBLE do it differently
                            // TODO account for a method in a class in a function
                            classes.insert(0, "::");
                            classes.insert(0, ((ClassOrInterfaceDeclaration) ancestor).getName());
                        }
                    }
                    output.add(new Tuple(
                            classes.toString() + n.getName() + "(" + parameters.toString() + ")",
                            n.getRange().isPresent() ? n.getRange().get().begin.line : 0
                    ));
                    // System.out.println(classes.toString() + n.getName() + "(" + parameters.toString() + ") - " + n.getRange().get().begin.line);
                }
            }.visit(JavaParser.parse(Paths.get(path).toFile()), null);
            return output;
        } catch (IOException ioe) {
            throw new InternalError("ParseController::getMethods(..) - Was not able to read file from disk");
        }
    }
}
