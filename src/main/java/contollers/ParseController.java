package contollers;

import com.felixgrund.codeshovel.entities.Yparameter;
import com.felixgrund.codeshovel.exceptions.NoParserFoundException;
import com.felixgrund.codeshovel.exceptions.ParseException;
import com.felixgrund.codeshovel.parser.Yfunction;
import com.felixgrund.codeshovel.parser.Yparser;
import com.felixgrund.codeshovel.parser.impl.JavaParser;
import com.felixgrund.codeshovel.parser.impl.PythonParser;
import com.felixgrund.codeshovel.parser.impl.TypeScriptParser;
import com.felixgrund.codeshovel.services.RepositoryService;
import com.felixgrund.codeshovel.services.impl.CachingRepositoryService;
import com.felixgrund.codeshovel.util.ParserFactory;
import com.felixgrund.codeshovel.util.Utl;
import com.felixgrund.codeshovel.wrappers.Commit;
import com.felixgrund.codeshovel.wrappers.StartEnvironment;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.lib.Repository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

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
            StartEnvironment startEnv = new StartEnvironment(repositoryService);
            startEnv.setRepositoryPath(repositoryPathGit);
            startEnv.setFilePath(filepath);
            startEnv.setStartCommitName(startCommitName);
            startEnv.setFileName(Utl.getFileName(startEnv.getFilePath()));
            startEnv.setStartCommit(startCommit);
            String startFileContent = repositoryService.findFileContent(startCommit, filepath);
            Yparser parser = ParserFactory.getParser(startEnv, filepath, startFileContent, startEnv.getStartCommit());

            List<Yfunction> methods = parser.getAllMethods();
            for (Yfunction method : methods) {
                String longName = buildLongName(method, filepath);
                int startLine = method.getNameLineNumber();
                String methodName = method.getName();
                boolean isStatic = method.getModifiers().getModifiers().contains("static");
                boolean isAbstract = method.getModifiers().getModifiers().contains("abstract");
                String visibility = "";
                if (method.getModifiers().getModifiers().contains("public")) {
                    visibility = "public";
                } else if (method.getModifiers().getModifiers().contains("private")) {
                    visibility = "private";
                } else if (method.getModifiers().getModifiers().contains("protected")) {
                    visibility = "protected";
                }
                output.add(new MethodTransport(longName, startLine, methodName, isStatic, isAbstract, visibility));
            }

            return output;
        } catch (IOException ioe) {
            System.out.println("ParseController::getMethods(..) - Error reading from disk " + ioe.toString());
            throw new InternalError("Was not able to read file from disk");
        } catch (NoParserFoundException e) {
            System.out.println("ParseController::getMethods(..) - Error finding parser " + e.toString());
            throw new InternalError("Was not able to get required parser");
        } catch (ParseException e) {
            System.out.println("ParseController::getMethods(..) - Error parsing supplied file " + e.toString());
            throw new InternalError("Was not able to parse input file");
        }
    }

    private static String buildLongName(Yfunction method, String filepath) {
        if (filepath.matches(PythonParser.ACCEPTED_FILE_EXTENSION)) {
            return buildPythonLongName(method);
        } else if (filepath.matches(JavaParser.ACCEPTED_FILE_EXTENSION)) {
            return buildJavaLongName(method);
        } else if (filepath.matches(TypeScriptParser.ACCEPTED_FILE_EXTENSION)) {
            return buildTypeScriptLongName(method);
        } else {
            throw new IllegalArgumentException("Unsupported extension provided");
        }
    }

    private static String buildJavaLongName(Yfunction method) {
        StringBuilder longName = new StringBuilder();
        for (String m : method.getModifiers().getModifiers()) {
            longName.append(m);
            longName.append(" ");
        }
        longName.append(method.getReturnStmt().getType());
        longName.append(" ");
        longName.append(method.getName());
        longName.append("(");
        if (method.getParameters().size() != 0) {
            for (Yparameter p : method.getParameters()) {
                longName.append(p.getType());
                longName.append(" ");
                longName.append(p.getName());
                longName.append(", ");
            }
            longName.delete(longName.length() - 2, longName.length());
        }
        longName.append(");");
        return longName.toString();
    }

    private static String buildPythonLongName(Yfunction method) {
        StringBuilder longName = new StringBuilder();
        for (String m : method.getModifiers().getModifiers()) {
            longName.append(m);
            longName.append(" ");
        }
        longName.append(method.getName());
        longName.append("(");
        if (method.getParameters().size() != 0) {
            for (Yparameter p : method.getParameters()) {
                longName.append(p.getName());
                if (!p.getType().equals("")) {
                    longName.append(":");
                    longName.append(p.getType());
                }
                longName.append(", ");
            }
            longName.delete(longName.length() - 2, longName.length());
        }
        longName.append(")");
        if (!method.getReturnStmt().getType().equals("")) {
            longName.append(" -> ");
            longName.append(method.getReturnStmt().getType());
        }
        return longName.toString();
    }

    private static String buildTypeScriptLongName(Yfunction method) {
        StringBuilder longName = new StringBuilder();
        // TODO I have no idea if it's a function or a method.
        for (String m : method.getModifiers().getModifiers()) {
            longName.append(m);
            longName.append(" ");
        }
        if (preferFunctionKeyword(method.getName(), method.getModifiers().getModifiers())) {
            longName.append("function ");
        }
        longName.append(method.getName());
        longName.append("(");
        if (method.getParameters().size() != 0) {
            for (Yparameter p : method.getParameters()) {
                longName.append(p.getName());
                if (!p.getType().equals("")) {
                    longName.append(": ");
                    longName.append(p.getType());
                }
                longName.append(", ");
            }
            longName.delete(longName.length() - 2, longName.length());
        }
        longName.append(")");
        if (!method.getReturnStmt().getType().equals("")) {
            longName.append(": ");
            longName.append(method.getReturnStmt().getType());
        }
        longName.append(";");
        return longName.toString();
    }

    private static boolean preferFunctionKeyword(String name, List<String> ymodifiers) {
        if (name.equals("constructor")) {
            return false;
        }
        if (ymodifiers.isEmpty()) {
            return true;
        }
        if (ymodifiers.contains("export")) {
            return true;
        }
        return ymodifiers.size() == 1 && ymodifiers.contains("async");
    }
}
