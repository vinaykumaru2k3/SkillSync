package com.skillsync.user.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.UUID;

@Service
public class FileStorageService {

    private final WebClient supabaseWebClient;
    private final String bucketName;
    private final String supabaseUrl;

    public FileStorageService(
            WebClient supabaseWebClient,
            @Value("${supabase.storage.bucket}") String bucketName,
            @Value("${supabase.url}") String supabaseUrl) {
        this.supabaseWebClient = supabaseWebClient;
        this.bucketName = bucketName;
        this.supabaseUrl = supabaseUrl;
    }

    public String storeFile(MultipartFile file) {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String fileName = UUID.randomUUID().toString() + fileExtension;
        String filePath = fileName;

        try {
            // Upload to Supabase Storage
            supabaseWebClient.post()
                    .uri("/storage/v1/object/" + bucketName + "/" + filePath)
                    .contentType(MediaType.parseMediaType(file.getContentType()))
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(file.getSize()))
                    .bodyValue(file.getBytes())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // Return public URL
            return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + filePath;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName, ex);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to upload file to Supabase: " + ex.getMessage(), ex);
        }
    }

    public void deleteFile(String fileUrl) {
        try {
            // Extract file path from URL
            String filePath = extractFilePathFromUrl(fileUrl);
            
            if (filePath == null) {
                return; // Invalid URL, nothing to delete
            }

            supabaseWebClient.delete()
                    .uri("/storage/v1/object/" + bucketName + "/" + filePath)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception ex) {
            throw new RuntimeException("Could not delete file: " + ex.getMessage(), ex);
        }
    }

    private String extractFilePathFromUrl(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains("/storage/v1/object/public/" + bucketName + "/")) {
            return null;
        }
        
        String[] parts = fileUrl.split("/storage/v1/object/public/" + bucketName + "/");
        return parts.length > 1 ? parts[1] : null;
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 10MB");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        return (lastDotIndex == -1) ? "" : filename.substring(lastDotIndex);
    }
}
