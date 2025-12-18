package com.skillforge.repository;

import com.skillforge.entity.Video;
import com.skillforge.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    List<Video> findByCourse(Course course);
}

