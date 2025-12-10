package com.skillforge.dto;

import lombok.Data;

@Data
public class VideoRequest {
    private String title;
    private String description;
    private String videoType; // UPLOADED, YOUTUBE, EXTERNAL
    private String externalUrl; // For YouTube/external links
}

