package server;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.AbstractRequestLoggingFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import static java.nio.charset.StandardCharsets.UTF_8;

@Component
public class CustomRequestLoggingFilter extends AbstractRequestLoggingFilter {
    CustomRequestLoggingFilter() {

    }

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException
    {
        StringBuilder msg = new StringBuilder();
        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        filterChain.doFilter(requestWrapper, responseWrapper);

        // CLIENT
        msg.append(requestWrapper.getRemoteAddr()).append(',');

        // ENDPOINT
        msg.append(requestWrapper.getRequestURI().substring(1)).append(',');

        // QUERY
        msg.append(requestWrapper.getQueryString().replaceAll(",", "")).append(',');

        // STATUS CODE
        msg.append(responseWrapper.getStatusCode()).append(',');

        // RESPONSE LENGTH
        try {
            msg.append(objectMapper.readTree(IOUtils.toString(responseWrapper.getContentInputStream(), UTF_8)).size()).append(',');
        } catch (Exception e) {
            msg.append("0,");
        }

        msg.append('\n');

        File file = new File("requests.csv");
        FileWriter writer = new FileWriter(file, true);
        writer.write(msg.toString());
        writer.close();

        responseWrapper.copyBodyToResponse();
        super.doFilterInternal(request, response, filterChain);
    }

    @Override
    protected String createMessage(HttpServletRequest request, String prefix, String suffix) {
        return "";
    }

    protected boolean shouldLog(HttpServletRequest request) {
        return this.logger.isInfoEnabled();
    }

    protected void beforeRequest(HttpServletRequest request, String message) {
        // pass
    }

    protected void afterRequest(HttpServletRequest request, String message) {
        // pass
    }
}
