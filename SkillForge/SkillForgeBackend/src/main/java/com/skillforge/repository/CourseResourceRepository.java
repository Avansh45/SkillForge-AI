package com.skillforge.repository;

import com.skillforge.entity.Course;
import com.skillforge.entity.CourseResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseResourceRepository extends JpaRepository<CourseResource, Long> {
    List<CourseResource> findByCourse(Course course);
    List<CourseResource> findByCourseOrderByCreatedAtDesc(Course course);
}
