package com.skillforge.repository;

import com.skillforge.entity.Batch;
import com.skillforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByInstructor(User instructor);
}

