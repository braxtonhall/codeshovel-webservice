package contollers;

import errors.ServerBusyException;
import org.apache.commons.io.FileUtils;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.JGitInternalException;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import wrappers.WebServiceEnv;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RepoController {
    private static final String cachePathString = "./cache";

    public static String performClear() {
        return RepoController.performClear(cachePathString);
    }

    private static String performClear(String pathString) {
        try {
            Path path = Paths.get(pathString);
            File dir = path.toFile();
            if (dir.exists()) {
                FileUtils.deleteDirectory(dir);
            }
            if(dir.mkdir()) {
                return "Successfully cleared the cache!";
            } else {
                throw new InternalError("RepoController::performClear() was not able to allocate a new cache directory.");
            }
        } catch (IOException e) {
            System.out.println(e.toString());
            throw new InternalError("RepoController::performClear() - was not able to clear the cache.");
        }
    }

    public static String cloneRepository(String cloneurl, boolean noCache) {
        Matcher matcher = Pattern.compile("[A-Z0-9a-z]+\\.git$").matcher(cloneurl);

        if (!matcher.find()) {
            throw new IllegalArgumentException("cloneurl does not appear to be a git URL. Should end in \".git\"");
        }

        String cacheRepositoryPath = cachePathString + cloneurl
                .replace("https://", "/")
                .replace(".git", "");
        File cloneDirectoryFile = Paths.get(cacheRepositoryPath).toFile();
        cloneurl = cloneurl.replace("https://", "https://" + WebServiceEnv.GITHUB_TOKEN + "@");
        // TODO this shouldn't be needed for public repos

        if (!noCache && cloneDirectoryFile.exists()) {
            System.out.println("RepoController::cloneRepository() - Directory already existed. Beginning Fetch.");
            try {
                Git git = Git.open(cloneDirectoryFile);
                git.fetch().setRemote("origin").call();
                return cacheRepositoryPath;
            } catch (Exception e) {
                try {
                    FileUtils.deleteDirectory(cloneDirectoryFile);
                } catch (IOException ioe) {
                    throw new InternalError("RepoController::cloneRepository() - Was not able to access files on disk");
                }
            }
        }
        for (int i = 0; i < 2; i++) {
            try {
                Git.cloneRepository()
                        .setURI(cloneurl)
                        .setDirectory(cloneDirectoryFile)
                        .setCredentialsProvider(new UsernamePasswordCredentialsProvider("token", ""))
                        .call();
                return cacheRepositoryPath;
            } catch (GitAPIException e) {
                System.out.println(e.toString());
                throw new InternalError("Was not able to clone " + cloneurl + "; Reason: " + e.toString());
            } catch (JGitInternalException e) {
                System.out.println(e.toString());
                performClear(cloneDirectoryFile.getPath());
                System.out.println("Cache clear successful");
            }
        }
        throw new InternalError("RepoController::cloneRepository() - Was not able to clone after clearing cache");
    }

    public static void checkout(String repositoryPath, String sha) {
        try {
            Git git = Git.open(Paths.get(repositoryPath).toFile());
            git.fetch().setRemote("origin").call();
            if (sha.equals("HEAD")) {
                git.checkout().setName("master").call();
            } else {
                git.checkout().setName(sha).call();
            }
        } catch (IOException ioe) {
            throw new InternalError("RepoController::checkout() - Was not able to open the repository that is on disk");
        } catch (JGitInternalException jgie) {
            if (jgie.toString().contains(": Cannot lock ")) {
                throw new ServerBusyException("RepoController::checkout() - Was not able to obtain lock");
            } else {
                throw new InternalError("RepoController::checkout() - Was not able to checkout " + sha);
            }
        } catch (Exception e) {
            System.out.println(e.toString());
            throw new InternalError("RepoController::checkout() - Was not able to checkout " + sha);
        }
    }

    public static Collection<String> getFiles(String path, String subPathToHide) {
        return RepoController.getFiles(Paths.get(path).toFile(), subPathToHide);
    }

    private static Collection<String> getFiles(File directory, String subPathToHide) {
        Collection<String> listOfFiles = new ArrayList<String>();

        File[] children = directory.listFiles();
        if (children != null) {
            for(File child : children) {
                if (child.isDirectory()) {
                    listOfFiles.addAll(getFiles(child, subPathToHide));
                } else {
                    String childPath = child.getPath();
                    if (childPath.endsWith(".java")) {
                        listOfFiles.add(childPath.replace(subPathToHide, ""));
                    }
                }
            }
        }
        return listOfFiles;
    }
}
