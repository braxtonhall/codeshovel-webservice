package com.ubcspl.codeshovel.models;

import com.felixgrund.codeshovel.services.RepositoryService;
import com.felixgrund.codeshovel.services.impl.CachingRepositoryService;
import com.felixgrund.codeshovel.util.Utl;
import com.felixgrund.codeshovel.wrappers.Commit;
import com.ubcspl.codeshovel.errors.NotFoundException;
import org.apache.commons.io.FileUtils;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.JGitInternalException;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import com.ubcspl.codeshovel.wrappers.WebServiceEnv;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Repo {
    private static final String cachePathString = "./cache";

    public static String performClear() {
        return Repo.performClear(cachePathString);
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
                throw new InternalError("Repo::performClear() was not able to allocate a new cache directory.");
            }
        } catch (IOException e) {
            System.out.println(e.toString());
            throw new InternalError("Repo::performClear() - was not able to clear the cache.");
        }
    }

    public static String cloneRepository(String cloneurl, boolean noCache, boolean noFetch) {
        System.out.println("Repo: " + cloneurl);
        System.out.println("No Cache?: " + noCache);
        System.out.println("No Fetch?: " + noFetch);

        Matcher matcher = Pattern.compile("[A-Z0-9a-z]+\\.git$").matcher(cloneurl);

        if (!matcher.find()) {
            throw new IllegalArgumentException("cloneurl does not appear to be a git URL. Should end in \".git\"");
        }

        String cacheRepositoryPath = cachePathString + cloneurl
                .replace("https://", "/")
                .replace(".git", "");
        File cloneDirectoryFile = Paths.get(cacheRepositoryPath).toFile();
        // cloneurl = cloneurl.replace("https://", "https://" + WebServiceEnv.GITHUB_TOKEN + "@");
        boolean repoExists = cloneDirectoryFile.exists();

        if (noFetch && repoExists) {
            System.out.println("Repo::cloneRepository() - No fetch required and repo exists");
            return cacheRepositoryPath;
        }
//        else if (noFetch) {
//            throw new NotFoundException("Repo is not already in cache");
//        }

        if (!noCache && !noFetch && repoExists) {
            System.out.println("Repo::cloneRepository() - Directory already existed. Beginning Fetch.");
            try {
                Git git = Git.open(cloneDirectoryFile);
                git.fetch().setRemote("origin").call();
                return cacheRepositoryPath;
            } catch (Exception e) {
                try {
                    System.out.println("Repo::cloneRepository() - Fetch failed. Deleting repo on disk.");
                    FileUtils.deleteDirectory(cloneDirectoryFile);
                } catch (IOException ioe) {
                    throw new InternalError("Repo::cloneRepository() - Was not able to access files on disk");
                }
            }
        }

        for (int i = 0; i < 2; i++) {
            System.out.println("Repo::cloneRepository() - Cloning repo. Attempt " + (i + 1));
            try {
                Git.cloneRepository()
                        .setURI(cloneurl)
                        .setDirectory(cloneDirectoryFile)
                        .setCredentialsProvider(new UsernamePasswordCredentialsProvider("token", ""))
                        .call();
                return cacheRepositoryPath;
            } catch (GitAPIException e) {
                System.out.println("Repo::cloneRepository() - Clone failed, GitAPI. Error:");
                System.out.println(e.toString());
                throw new InternalError("Was not able to clone " + cloneurl + "; Reason: " + e.toString());
            } catch (JGitInternalException e) {
                System.out.println("Repo::cloneRepository() - Clone failed, JGit. Error:");
                System.out.println(e.toString());
                System.out.println("Repo::cloneRepository() - Wiping all repos.");
                performClear(cloneDirectoryFile.getPath());
                System.out.println("Cache clear successful");
            }
        }
        throw new InternalError("Repo::cloneRepository() - Was not able to clone after clearing cache");
    }

    public static Collection<String> getFiles(String repositoryPathGit,
                                              String repositoryName,
                                              String startCommitName) {
        try {
            Repository repository = Utl.createRepository(repositoryPathGit);
            Git git = new Git(repository);
            RepositoryService repositoryService = new CachingRepositoryService(git, repository, repositoryName, repositoryPathGit);
            Commit startCommit = repositoryService.findCommitByName(startCommitName);
            List<String> files = new ArrayList<>();
            for (String extension : WebServiceEnv.LEGAL_EXTENSIONS.split(",")) {
                files.addAll(repositoryService.findFilesByExtension(startCommit, extension));
            }
            return files;
        } catch (IOException ioe) {
            throw new InternalError("Repo::getFiles() - Was not able to find commit");
        } catch (Exception e) {
            throw new InternalError("Repo::getFiles() - Was not able to find files in this commit");
        }
    }
}
