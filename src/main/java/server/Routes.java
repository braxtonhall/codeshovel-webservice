package server;

import com.felixgrund.codeshovel.entities.Yresult;
import com.felixgrund.codeshovel.execution.ShovelExecution;
import com.felixgrund.codeshovel.services.RepositoryService;
import com.felixgrund.codeshovel.services.impl.CachingRepositoryService;
import com.felixgrund.codeshovel.util.Utl;
import com.felixgrund.codeshovel.wrappers.Commit;
import com.felixgrund.codeshovel.wrappers.StartEnvironment;
import org.apache.commons.io.FileUtils;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.JGitInternalException;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.json.simple.parser.JSONParser;
import wrappers.WebServiceEnv;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class Routes {
    private static final String cachePathString = "./cache";

    static String performDig(String cloneurl, String filepath, String methodname, String startline, String startCommitName) {
        int intStartLine = Integer.parseInt(startline);
        Matcher matcher = Pattern.compile("[A-Z0-9a-z]+\\.git$").matcher(cloneurl);
        if (!matcher.find()) {
            throw new IllegalArgumentException("cloneurl does not appear to be a git URL. Should end in \".git\"");
        }

        String repositoryName = cloneurl.substring(matcher.start(), matcher.end() - 4);
        String repositoryPath = cachePathString + "/" + repositoryName;
        File cloneDirectoryFile = Paths.get(repositoryPath).toFile();
        cloneurl = cloneurl.replace("https://", "https://" + WebServiceEnv.GITHUB_TOKEN + "@");
        String gitPathEnding = "/" + ".git";
        String repositoryPathGit = repositoryPath + gitPathEnding;
        String outFilePath = repositoryPath + "/cdshvl/out.json";

        cloneRepository(cloneurl, cloneDirectoryFile);

        try {
            return runShovelExecution(repositoryPathGit, repositoryName,
                    startCommitName, filepath, methodname, outFilePath, intStartLine);
        } catch (Exception e) {
            System.out.println(e.toString());
            throw new InternalError("Was not able to perform the dig!");
        } finally {
            performClear();
        }
    }

    static String performClear() {
        try {
            Path path = Paths.get(cachePathString);
            File dir = path.toFile();
            if (dir.exists()) {
                FileUtils.deleteDirectory(dir);
            }
            if(dir.mkdir()) {
                return "Successfully cleared the cache!";
            } else {
                throw new InternalError("Routes::performClear was not able to allocate a new cache directory.");
            }
        } catch (IOException e) {
            System.out.println(e.toString());
            throw new InternalError("Routes::performClear as not able to clear the cache.");
        }

    }

    private static void cloneRepository(String cloneurl, File cloneDirectoryFile) {
        while(true) {
            try {
                Git.cloneRepository()
                        .setURI(cloneurl)
                        .setDirectory(cloneDirectoryFile)
                        .setCredentialsProvider(new UsernamePasswordCredentialsProvider("token", ""))
                        .call();
                break;
            } catch (GitAPIException e) {
                System.out.println(e.toString());
                throw new InternalError("Was not able to clone " + cloneurl + "; Reason: " + e.toString());
            } catch (JGitInternalException e) {
                System.out.println(e.toString());
                performClear();
                System.out.println("Cache clear successful; Retrying clone.");
            }
        }
    }

    private static String runShovelExecution(
            String repositoryPathGit,
            String repositoryName,
            String startCommitName,
            String filepath,
            String methodname,
            String outFilePath,
            int startLine
    ) throws Exception {
        Repository repository = Utl.createRepository(repositoryPathGit);
        Git git = new Git(repository);
        RepositoryService repositoryService = new CachingRepositoryService(git, repository, repositoryName, repositoryPathGit);
        Commit startCommit = repositoryService.findCommitByName(startCommitName);

        StartEnvironment startEnv = new StartEnvironment(repositoryService);
        startEnv.setRepositoryPath(repositoryPathGit);
        startEnv.setFilePath(filepath);
        startEnv.setFunctionName(methodname);
        startEnv.setFunctionStartLine(startLine);
        startEnv.setStartCommitName(startCommitName);
        startEnv.setStartCommit(startCommit);
        startEnv.setFileName(Utl.getFileName(startEnv.getFilePath()));
        startEnv.setOutputFilePath(outFilePath);

        return ShovelExecution.runSingle(startEnv, startEnv.getFilePath(), true).toJson();

        // return readOutputFromDisk(outFilePath);
    }

    private static Object readOutputFromDisk(String path) {
        try {
            JSONParser parser = new JSONParser();
            FileReader reader = new FileReader(path);
            return parser.parse(reader);
        } catch (Exception e) {
            System.out.println(e.toString());
            throw new InternalError("Was not able to read the saved data from disk.");
        }
    }
}
