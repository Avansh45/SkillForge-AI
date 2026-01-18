package com.skillforge.service;

import com.skillforge.entity.*;
import com.skillforge.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamAttemptRepository examAttemptRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    @SuppressWarnings("unused")
    private QuestionRepository questionRepository;

    // ============================================================================
    // STUDENT ANALYTICS
    // ============================================================================

    /**
     * Get comprehensive analytics for a student
     * Only returns data for the authenticated student
     */
    public Map<String, Object> getStudentAnalytics(String email) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getRole() != User.Role.STUDENT) {
            throw new RuntimeException("User is not a student");
        }

        Map<String, Object> analytics = new HashMap<>();
        
        // Basic info
        analytics.put("studentId", student.getId());
        analytics.put("studentName", student.getName());
        
        // Courses enrolled
        analytics.put("courses", getStudentCoursesAnalytics(student));
        
        // Exams attempted
        analytics.put("exams", getStudentExamsAnalytics(student));
        
        // Assignments submitted
        analytics.put("assignments", getStudentAssignmentsAnalytics(student));
        
        // Overall progress
        analytics.put("overallProgress", getStudentOverallProgress(student));
        
        // Performance summary
        analytics.put("performance", getStudentPerformanceSummary(student));
        
        return analytics;
    }

    private Map<String, Object> getStudentCoursesAnalytics(User student) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);
        
        Map<String, Object> coursesData = new HashMap<>();
        coursesData.put("totalEnrolled", enrollments.size());
        
        // Calculate progress categories
        long nearlyComplete = enrollments.stream()
                .filter(e -> e.getProgressPercentage() != null && e.getProgressPercentage() >= 90)
                .count();
        long inProgress = enrollments.stream()
                .filter(e -> e.getProgressPercentage() != null && 
                        e.getProgressPercentage() >= 50 && e.getProgressPercentage() < 90)
                .count();
        long justStarted = enrollments.stream()
                .filter(e -> e.getProgressPercentage() == null || e.getProgressPercentage() < 50)
                .count();
        
        coursesData.put("nearlyComplete", nearlyComplete);
        coursesData.put("inProgress", inProgress);
        coursesData.put("justStarted", justStarted);
        
        // Course details
        List<Map<String, Object>> coursesList = enrollments.stream()
                .map(enrollment -> {
                    Map<String, Object> courseData = new HashMap<>();
                    Course course = enrollment.getCourse();
                    courseData.put("courseId", course.getId());
                    courseData.put("courseTitle", course.getTitle());
                    courseData.put("instructorName", course.getInstructor() != null ? 
                            course.getInstructor().getName() : "Unknown");
                    courseData.put("enrolledAt", enrollment.getEnrolledAt());
                    courseData.put("progressPercentage", enrollment.getProgressPercentage() != null ? 
                            enrollment.getProgressPercentage() : 0.0);
                    
                    // Count videos available in this course
                    long videosCount = videoRepository.findByCourse(course).size();
                    courseData.put("videosAvailable", videosCount);
                    
                    return courseData;
                })
                .collect(Collectors.toList());
        
        coursesData.put("coursesList", coursesList);
        
        return coursesData;
    }

    private Map<String, Object> getStudentExamsAnalytics(User student) {
        List<ExamAttempt> attempts = examAttemptRepository.findByStudent(student);
        
        Map<String, Object> examsData = new HashMap<>();
        examsData.put("totalAttempts", attempts.size());
        
        // Count unique exams
        long uniqueExams = attempts.stream()
                .map(attempt -> attempt.getExam().getId())
                .distinct()
                .count();
        examsData.put("uniqueExamsAttempted", uniqueExams);
        
        if (!attempts.isEmpty()) {
            // Calculate statistics
            double avgScore = attempts.stream()
                    .mapToDouble(ExamAttempt::getScore)
                    .average()
                    .orElse(0.0);
            double avgPercentage = attempts.stream()
                    .mapToDouble(attempt -> attempt.getPercentage() != null ? attempt.getPercentage() : 0.0)
                    .average()
                    .orElse(0.0);
            
            double minScore = attempts.stream()
                    .mapToDouble(ExamAttempt::getScore)
                    .min()
                    .orElse(0.0);
            double maxScore = attempts.stream()
                    .mapToDouble(ExamAttempt::getScore)
                    .max()
                    .orElse(0.0);
            
            long totalCorrect = attempts.stream()
                    .mapToLong(attempt -> attempt.getCorrectAnswers() != null ? attempt.getCorrectAnswers() : 0)
                    .sum();
            long totalWrong = attempts.stream()
                    .mapToLong(attempt -> attempt.getWrongAnswers() != null ? attempt.getWrongAnswers() : 0)
                    .sum();
            
            examsData.put("averageScore", Math.round(avgScore * 100.0) / 100.0);
            examsData.put("averagePercentage", Math.round(avgPercentage * 100.0) / 100.0);
            examsData.put("lowestScore", Math.round(minScore * 100.0) / 100.0);
            examsData.put("highestScore", Math.round(maxScore * 100.0) / 100.0);
            examsData.put("totalCorrectAnswers", totalCorrect);
            examsData.put("totalWrongAnswers", totalWrong);
            
            // Recent attempts (last 5)
            List<Map<String, Object>> recentAttempts = attempts.stream()
                    .sorted((a, b) -> b.getAttemptedAt().compareTo(a.getAttemptedAt()))
                    .limit(5)
                    .map(attempt -> {
                        Map<String, Object> attemptData = new HashMap<>();
                        attemptData.put("examId", attempt.getExam().getId());
                        attemptData.put("examTitle", attempt.getExam().getTitle());
                        attemptData.put("score", Math.round(attempt.getScore() * 100.0) / 100.0);
                        attemptData.put("percentage", attempt.getPercentage() != null ? 
                                Math.round(attempt.getPercentage() * 100.0) / 100.0 : 0.0);
                        attemptData.put("attemptedAt", attempt.getAttemptedAt());
                        return attemptData;
                    })
                    .collect(Collectors.toList());
            
            examsData.put("recentAttempts", recentAttempts);
        } else {
            examsData.put("averageScore", 0.0);
            examsData.put("averagePercentage", 0.0);
            examsData.put("lowestScore", 0.0);
            examsData.put("highestScore", 0.0);
            examsData.put("totalCorrectAnswers", 0);
            examsData.put("totalWrongAnswers", 0);
            examsData.put("recentAttempts", Collections.emptyList());
        }
        
        return examsData;
    }

    private Map<String, Object> getStudentAssignmentsAnalytics(User student) {
        List<AssignmentSubmission> submissions = submissionRepository.findByStudentOrderBySubmittedAtDesc(student);
        
        Map<String, Object> assignmentsData = new HashMap<>();
        assignmentsData.put("totalSubmitted", submissions.size());
        
        // Count graded vs pending
        long graded = submissions.stream()
                .filter(s -> s.getMarksAwarded() != null)
                .count();
        long pending = submissions.size() - graded;
        
        assignmentsData.put("graded", graded);
        assignmentsData.put("pendingGrading", pending);
        
        // Calculate average grade (only for graded submissions)
        List<AssignmentSubmission> gradedSubmissions = submissions.stream()
                .filter(s -> s.getMarksAwarded() != null && s.getAssignment() != null)
                .collect(Collectors.toList());
        
        if (!gradedSubmissions.isEmpty()) {
            double avgPercentage = gradedSubmissions.stream()
                    .mapToDouble(s -> (s.getMarksAwarded() / s.getAssignment().getMaxMarks()) * 100.0)
                    .average()
                    .orElse(0.0);
            assignmentsData.put("averageGradePercentage", Math.round(avgPercentage * 100.0) / 100.0);
        } else {
            assignmentsData.put("averageGradePercentage", 0.0);
        }
        
        return assignmentsData;
    }

    private Map<String, Object> getStudentOverallProgress(User student) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);
        
        Map<String, Object> progressData = new HashMap<>();
        
        if (!enrollments.isEmpty()) {
            double avgProgress = enrollments.stream()
                    .mapToDouble(e -> e.getProgressPercentage() != null ? e.getProgressPercentage() : 0.0)
                    .average()
                    .orElse(0.0);
            
            progressData.put("overallProgressPercentage", Math.round(avgProgress * 100.0) / 100.0);
        } else {
            progressData.put("overallProgressPercentage", 0.0);
        }
        
        progressData.put("totalCoursesEnrolled", enrollments.size());
        
        return progressData;
    }

    private Map<String, Object> getStudentPerformanceSummary(User student) {
        Map<String, Object> summary = new HashMap<>();
        
        List<ExamAttempt> attempts = examAttemptRepository.findByStudent(student);
        List<AssignmentSubmission> submissions = submissionRepository.findByStudentOrderBySubmittedAtDesc(student);
        
        // Exam performance
        if (!attempts.isEmpty()) {
            double examAvg = attempts.stream()
                    .mapToDouble(ExamAttempt::getScore)
                    .average()
                    .orElse(0.0);
            summary.put("examAverageScore", Math.round(examAvg * 100.0) / 100.0);
        } else {
            summary.put("examAverageScore", 0.0);
        }
        
        // Assignment performance
        List<AssignmentSubmission> gradedSubmissions = submissions.stream()
                .filter(s -> s.getMarksAwarded() != null && s.getAssignment() != null)
                .collect(Collectors.toList());
        
        if (!gradedSubmissions.isEmpty()) {
            double assignmentAvg = gradedSubmissions.stream()
                    .mapToDouble(s -> (s.getMarksAwarded() / s.getAssignment().getMaxMarks()) * 100.0)
                    .average()
                    .orElse(0.0);
            summary.put("assignmentAveragePercentage", Math.round(assignmentAvg * 100.0) / 100.0);
        } else {
            summary.put("assignmentAveragePercentage", 0.0);
        }
        
        return summary;
    }

    // ============================================================================
    // INSTRUCTOR ANALYTICS
    // ============================================================================

    /**
     * Get comprehensive analytics for an instructor
     * Only returns data for courses taught by the authenticated instructor
     */
    public Map<String, Object> getInstructorAnalytics(String email) {
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        if (instructor.getRole() != User.Role.INSTRUCTOR) {
            throw new RuntimeException("User is not an instructor");
        }

        Map<String, Object> analytics = new HashMap<>();
        
        // Basic info
        analytics.put("instructorId", instructor.getId());
        analytics.put("instructorName", instructor.getName());
        
        // Courses taught
        analytics.put("courses", getInstructorCoursesAnalytics(instructor));
        
        // Students taught
        analytics.put("students", getInstructorStudentsAnalytics(instructor));
        
        // Assignments created
        analytics.put("assignments", getInstructorAssignmentsAnalytics(instructor));
        
        // Exams created
        analytics.put("exams", getInstructorExamsAnalytics(instructor));
        
        // Student performance
        analytics.put("studentPerformance", getInstructorStudentPerformanceAnalytics(instructor));
        
        return analytics;
    }

    private Map<String, Object> getInstructorCoursesAnalytics(User instructor) {
        List<Course> courses = courseRepository.findByInstructor(instructor);
        
        Map<String, Object> coursesData = new HashMap<>();
        coursesData.put("totalCourses", courses.size());
        
        // Course details with stats
        List<Map<String, Object>> coursesList = courses.stream()
                .map(course -> {
                    Map<String, Object> courseData = new HashMap<>();
                    courseData.put("courseId", course.getId());
                    courseData.put("courseTitle", course.getTitle());
                    courseData.put("createdAt", course.getCreatedAt());
                    
                    // Count enrollments
                    long enrollmentCount = enrollmentRepository.findByCourse(course).size();
                    courseData.put("enrolledStudents", enrollmentCount);
                    
                    // Count exams
                    long examsCount = examRepository.findByCourse(course).size();
                    courseData.put("examsCount", examsCount);
                    
                    // Count assignments
                    long assignmentsCount = assignmentRepository.findByCourseOrderByDueDateDesc(course).size();
                    courseData.put("assignmentsCount", assignmentsCount);
                    
                    // Count videos
                    long videosCount = videoRepository.findByCourse(course).size();
                    courseData.put("videosCount", videosCount);
                    
                    return courseData;
                })
                .collect(Collectors.toList());
        
        coursesData.put("coursesList", coursesList);
        
        return coursesData;
    }

    private Map<String, Object> getInstructorStudentsAnalytics(User instructor) {
        List<Course> courses = courseRepository.findByInstructor(instructor);
        
        // Get all enrollments for instructor's courses
        Set<Long> uniqueStudentIds = courses.stream()
                .flatMap(course -> enrollmentRepository.findByCourse(course).stream())
                .map(enrollment -> enrollment.getStudent().getId())
                .collect(Collectors.toSet());
        
        Map<String, Object> studentsData = new HashMap<>();
        studentsData.put("totalStudentsTaught", uniqueStudentIds.size());
        
        // Students by course
        List<Map<String, Object>> studentsByCourse = courses.stream()
                .map(course -> {
                    Map<String, Object> courseStudents = new HashMap<>();
                    courseStudents.put("courseId", course.getId());
                    courseStudents.put("courseTitle", course.getTitle());
                    courseStudents.put("studentsEnrolled", enrollmentRepository.findByCourse(course).size());
                    return courseStudents;
                })
                .collect(Collectors.toList());
        
        studentsData.put("studentsByCourse", studentsByCourse);
        
        return studentsData;
    }

    private Map<String, Object> getInstructorAssignmentsAnalytics(User instructor) {
        List<Assignment> assignments = assignmentRepository.findByInstructorOrderByCreatedAtDesc(instructor);
        
        Map<String, Object> assignmentsData = new HashMap<>();
        assignmentsData.put("totalAssignments", assignments.size());
        
        // Count total submissions
        long totalSubmissions = assignments.stream()
                .mapToLong(assignment -> submissionRepository.findByAssignmentOrderBySubmittedAtDesc(assignment).size())
                .sum();
        assignmentsData.put("totalSubmissionsReceived", totalSubmissions);
        
        // Count graded vs pending
        long totalGraded = assignments.stream()
                .flatMap(assignment -> submissionRepository.findByAssignmentOrderBySubmittedAtDesc(assignment).stream())
                .filter(submission -> submission.getMarksAwarded() != null)
                .count();
        long totalPending = totalSubmissions - totalGraded;
        
        assignmentsData.put("graded", totalGraded);
        assignmentsData.put("pendingGrading", totalPending);
        
        return assignmentsData;
    }

    private Map<String, Object> getInstructorExamsAnalytics(User instructor) {
        List<Exam> exams = examRepository.findByInstructor(instructor);
        
        Map<String, Object> examsData = new HashMap<>();
        examsData.put("totalExams", exams.size());
        
        // Count total attempts
        long totalAttempts = exams.stream()
                .mapToLong(exam -> examAttemptRepository.findByExam(exam).size())
                .sum();
        examsData.put("totalAttempts", totalAttempts);
        
        // Count unique students who attempted
        Set<Long> uniqueStudents = exams.stream()
                .flatMap(exam -> examAttemptRepository.findByExam(exam).stream())
                .map(attempt -> attempt.getStudent().getId())
                .collect(Collectors.toSet());
        examsData.put("uniqueStudentsTested", uniqueStudents.size());
        
        // Exam details with stats
        List<Map<String, Object>> examsList = exams.stream()
                .map(exam -> {
                    Map<String, Object> examData = new HashMap<>();
                    examData.put("examId", exam.getId());
                    examData.put("examTitle", exam.getTitle());
                    examData.put("courseTitle", exam.getCourse() != null ? exam.getCourse().getTitle() : "N/A");
                    
                    List<ExamAttempt> attempts = examAttemptRepository.findByExam(exam);
                    examData.put("attemptsCount", attempts.size());
                    
                    if (!attempts.isEmpty()) {
                        double avgScore = attempts.stream()
                                .mapToDouble(ExamAttempt::getScore)
                                .average()
                                .orElse(0.0);
                        examData.put("averageScore", Math.round(avgScore * 100.0) / 100.0);
                    } else {
                        examData.put("averageScore", 0.0);
                    }
                    
                    return examData;
                })
                .collect(Collectors.toList());
        
        examsData.put("examsList", examsList);
        
        return examsData;
    }

    private Map<String, Object> getInstructorStudentPerformanceAnalytics(User instructor) {
        List<Exam> exams = examRepository.findByInstructor(instructor);
        
        // Get all attempts for instructor's exams
        List<ExamAttempt> allAttempts = exams.stream()
                .flatMap(exam -> examAttemptRepository.findByExam(exam).stream())
                .collect(Collectors.toList());
        
        Map<String, Object> performanceData = new HashMap<>();
        
        if (!allAttempts.isEmpty()) {
            double overallAvgScore = allAttempts.stream()
                    .mapToDouble(ExamAttempt::getScore)
                    .average()
                    .orElse(0.0);
            double overallAvgPercentage = allAttempts.stream()
                    .mapToDouble(attempt -> attempt.getPercentage() != null ? attempt.getPercentage() : 0.0)
                    .average()
                    .orElse(0.0);
            
            long passingAttempts = allAttempts.stream()
                    .filter(attempt -> attempt.getScore() >= 70.0)
                    .count();
            long failingAttempts = allAttempts.size() - passingAttempts;
            double passRate = (passingAttempts * 100.0) / allAttempts.size();
            
            performanceData.put("overallAverageScore", Math.round(overallAvgScore * 100.0) / 100.0);
            performanceData.put("overallAveragePercentage", Math.round(overallAvgPercentage * 100.0) / 100.0);
            performanceData.put("totalAttempts", allAttempts.size());
            performanceData.put("passingAttempts", passingAttempts);
            performanceData.put("failingAttempts", failingAttempts);
            performanceData.put("passRate", Math.round(passRate * 100.0) / 100.0);
        } else {
            performanceData.put("overallAverageScore", 0.0);
            performanceData.put("overallAveragePercentage", 0.0);
            performanceData.put("totalAttempts", 0);
            performanceData.put("passingAttempts", 0);
            performanceData.put("failingAttempts", 0);
            performanceData.put("passRate", 0.0);
        }
        
        // Performance by course
        List<Course> courses = courseRepository.findByInstructor(instructor);
        List<Map<String, Object>> performanceByCourse = courses.stream()
                .map(course -> {
                    Map<String, Object> coursePerf = new HashMap<>();
                    coursePerf.put("courseId", course.getId());
                    coursePerf.put("courseTitle", course.getTitle());
                    
                    List<Exam> courseExams = examRepository.findByCourse(course);
                    List<ExamAttempt> courseAttempts = courseExams.stream()
                            .flatMap(exam -> examAttemptRepository.findByExam(exam).stream())
                            .collect(Collectors.toList());
                    
                    coursePerf.put("attemptsCount", courseAttempts.size());
                    
                    if (!courseAttempts.isEmpty()) {
                        double avgScore = courseAttempts.stream()
                                .mapToDouble(ExamAttempt::getScore)
                                .average()
                                .orElse(0.0);
                        coursePerf.put("averageScore", Math.round(avgScore * 100.0) / 100.0);
                    } else {
                        coursePerf.put("averageScore", 0.0);
                    }
                    
                    return coursePerf;
                })
                .collect(Collectors.toList());
        
        performanceData.put("performanceByCourse", performanceByCourse);
        
        return performanceData;
    }

    // ============================================================================
    // ADMIN ANALYTICS
    // ============================================================================

    /**
     * Get comprehensive platform analytics for admin
     * Returns global statistics across all users, courses, and activities
     */
    public Map<String, Object> getAdminAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Users analytics
        analytics.put("users", getAdminUsersAnalytics());
        
        // Courses analytics
        analytics.put("courses", getAdminCoursesAnalytics());
        
        // Enrollments analytics
        analytics.put("enrollments", getAdminEnrollmentsAnalytics());
        
        // Exams analytics
        analytics.put("exams", getAdminExamsAnalytics());
        
        // Assignments and submissions
        analytics.put("assignments", getAdminAssignmentsAnalytics());
        
        // System activity trends
        analytics.put("activityTrends", getAdminActivityTrends());
        
        return analytics;
    }

    private Map<String, Object> getAdminUsersAnalytics() {
        Map<String, Object> usersData = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long students = userRepository.countByRole(User.Role.STUDENT);
        long instructors = userRepository.countByRole(User.Role.INSTRUCTOR);
        long admins = userRepository.countByRole(User.Role.ADMIN);
        
        usersData.put("totalUsers", totalUsers);
        usersData.put("students", students);
        usersData.put("instructors", instructors);
        usersData.put("admins", admins);
        
        Map<String, Long> byRole = new HashMap<>();
        byRole.put("STUDENT", students);
        byRole.put("INSTRUCTOR", instructors);
        byRole.put("ADMIN", admins);
        usersData.put("byRole", byRole);
        
        return usersData;
    }

    private Map<String, Object> getAdminCoursesAnalytics() {
        Map<String, Object> coursesData = new HashMap<>();
        
        long totalCourses = courseRepository.count();
        coursesData.put("totalCourses", totalCourses);
        
        // Count unique instructors
        List<Course> allCourses = courseRepository.findAll();
        long uniqueInstructors = allCourses.stream()
                .filter(course -> course.getInstructor() != null)
                .map(course -> course.getInstructor().getId())
                .distinct()
                .count();
        coursesData.put("uniqueInstructors", uniqueInstructors);
        
        // Average enrollments per course
        if (totalCourses > 0) {
            long totalEnrollments = enrollmentRepository.count();
            double avgEnrollments = (double) totalEnrollments / totalCourses;
            coursesData.put("averageEnrollmentsPerCourse", Math.round(avgEnrollments * 100.0) / 100.0);
        } else {
            coursesData.put("averageEnrollmentsPerCourse", 0.0);
        }
        
        return coursesData;
    }

    private Map<String, Object> getAdminEnrollmentsAnalytics() {
        Map<String, Object> enrollmentsData = new HashMap<>();
        
        List<Enrollment> allEnrollments = enrollmentRepository.findAll();
        enrollmentsData.put("totalEnrollments", allEnrollments.size());
        
        if (!allEnrollments.isEmpty()) {
            // Calculate average progress
            double avgProgress = allEnrollments.stream()
                    .mapToDouble(e -> e.getProgressPercentage() != null ? e.getProgressPercentage() : 0.0)
                    .average()
                    .orElse(0.0);
            enrollmentsData.put("averageProgress", Math.round(avgProgress * 100.0) / 100.0);
            
            // Count by progress categories
            long nearlyComplete = allEnrollments.stream()
                    .filter(e -> e.getProgressPercentage() != null && e.getProgressPercentage() >= 90)
                    .count();
            long barelyStarted = allEnrollments.stream()
                    .filter(e -> e.getProgressPercentage() == null || e.getProgressPercentage() < 10)
                    .count();
            
            enrollmentsData.put("nearlyComplete", nearlyComplete);
            enrollmentsData.put("barelyStarted", barelyStarted);
        } else {
            enrollmentsData.put("averageProgress", 0.0);
            enrollmentsData.put("nearlyComplete", 0);
            enrollmentsData.put("barelyStarted", 0);
        }
        
        return enrollmentsData;
    }

    private Map<String, Object> getAdminExamsAnalytics() {
        Map<String, Object> examsData = new HashMap<>();
        
        long totalExams = examRepository.count();
        examsData.put("totalExams", totalExams);
        
        // Count unique creators
        List<Exam> allExams = examRepository.findAll();
        long uniqueCreators = allExams.stream()
                .filter(exam -> exam.getInstructor() != null)
                .map(exam -> exam.getInstructor().getId())
                .distinct()
                .count();
        examsData.put("uniqueCreators", uniqueCreators);
        
        // Average questions per exam
        if (!allExams.isEmpty()) {
            double avgQuestions = allExams.stream()
                    .mapToInt(exam -> exam.getTotalQuestions() != null ? exam.getTotalQuestions() : 0)
                    .average()
                    .orElse(0.0);
            examsData.put("averageQuestionsPerExam", Math.round(avgQuestions * 100.0) / 100.0);
            
            double avgDuration = allExams.stream()
                    .mapToInt(exam -> exam.getDurationMinutes() != null ? exam.getDurationMinutes() : 0)
                    .average()
                    .orElse(0.0);
            examsData.put("averageDurationMinutes", Math.round(avgDuration * 100.0) / 100.0);
        } else {
            examsData.put("averageQuestionsPerExam", 0.0);
            examsData.put("averageDurationMinutes", 0.0);
        }
        
        // Exam attempts statistics
        List<ExamAttempt> allAttempts = examAttemptRepository.findAll();
        examsData.put("totalAttempts", allAttempts.size());
        
        if (!allAttempts.isEmpty()) {
            double avgScore = allAttempts.stream()
                    .mapToDouble(ExamAttempt::getScore)
                    .average()
                    .orElse(0.0);
            examsData.put("averageScore", Math.round(avgScore * 100.0) / 100.0);
            
            long passingAttempts = allAttempts.stream()
                    .filter(attempt -> attempt.getScore() >= 70.0)
                    .count();
            double passRate = (passingAttempts * 100.0) / allAttempts.size();
            examsData.put("passRate", Math.round(passRate * 100.0) / 100.0);
        } else {
            examsData.put("averageScore", 0.0);
            examsData.put("passRate", 0.0);
        }
        
        return examsData;
    }

    private Map<String, Object> getAdminAssignmentsAnalytics() {
        Map<String, Object> assignmentsData = new HashMap<>();
        
        long totalAssignments = assignmentRepository.count();
        assignmentsData.put("totalAssignments", totalAssignments);
        
        // Submissions statistics
        List<AssignmentSubmission> allSubmissions = submissionRepository.findAll();
        assignmentsData.put("totalSubmissions", allSubmissions.size());
        
        if (!allSubmissions.isEmpty()) {
            long graded = allSubmissions.stream()
                    .filter(s -> s.getMarksAwarded() != null)
                    .count();
            long pending = allSubmissions.size() - graded;
            
            assignmentsData.put("graded", graded);
            assignmentsData.put("pending", pending);
            
            // Average marks awarded (for graded submissions)
            List<AssignmentSubmission> gradedSubmissions = allSubmissions.stream()
                    .filter(s -> s.getMarksAwarded() != null && s.getAssignment() != null)
                    .collect(Collectors.toList());
            
            if (!gradedSubmissions.isEmpty()) {
                double avgPercentage = gradedSubmissions.stream()
                        .mapToDouble(s -> (s.getMarksAwarded() / s.getAssignment().getMaxMarks()) * 100.0)
                        .average()
                        .orElse(0.0);
                assignmentsData.put("averageGradePercentage", Math.round(avgPercentage * 100.0) / 100.0);
            } else {
                assignmentsData.put("averageGradePercentage", 0.0);
            }
            
            // Total storage used
            long totalStorage = allSubmissions.stream()
                    .mapToLong(s -> s.getFileSize() != null ? s.getFileSize() : 0)
                    .sum();
            assignmentsData.put("totalStorageBytes", totalStorage);
        } else {
            assignmentsData.put("graded", 0);
            assignmentsData.put("pending", 0);
            assignmentsData.put("averageGradePercentage", 0.0);
            assignmentsData.put("totalStorageBytes", 0);
        }
        
        return assignmentsData;
    }

    private Map<String, Object> getAdminActivityTrends() {
        Map<String, Object> trends = new HashMap<>();
        
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        
        // Enrollments trend (last 30 days)
        List<Enrollment> recentEnrollments = enrollmentRepository.findAll().stream()
                .filter(e -> e.getEnrolledAt() != null && e.getEnrolledAt().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());
        trends.put("enrollmentsLast30Days", recentEnrollments.size());
        
        // Exam attempts trend (last 30 days)
        List<ExamAttempt> recentAttempts = examAttemptRepository.findAll().stream()
                .filter(a -> a.getAttemptedAt() != null && a.getAttemptedAt().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());
        trends.put("examAttemptsLast30Days", recentAttempts.size());
        
        // Assignment submissions trend (last 30 days)
        List<AssignmentSubmission> recentSubmissions = submissionRepository.findAll().stream()
                .filter(s -> s.getSubmittedAt() != null && s.getSubmittedAt().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());
        trends.put("submissionsLast30Days", recentSubmissions.size());
        
        // Combined recent activity (last 15 activities)
        List<Map<String, Object>> recentActivities = new ArrayList<>();
        
        // Add enrollments
        recentEnrollments.stream()
                .sorted((a, b) -> b.getEnrolledAt().compareTo(a.getEnrolledAt()))
                .limit(5)
                .forEach(enrollment -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("type", "ENROLLMENT");
                    activity.put("timestamp", enrollment.getEnrolledAt());
                    activity.put("studentName", enrollment.getStudent().getName());
                    activity.put("relatedEntity", enrollment.getCourse().getTitle());
                    recentActivities.add(activity);
                });
        
        // Add exam attempts
        recentAttempts.stream()
                .sorted((a, b) -> b.getAttemptedAt().compareTo(a.getAttemptedAt()))
                .limit(5)
                .forEach(attempt -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("type", "EXAM_ATTEMPT");
                    activity.put("timestamp", attempt.getAttemptedAt());
                    activity.put("studentName", attempt.getStudent().getName());
                    activity.put("relatedEntity", attempt.getExam().getTitle());
                    activity.put("score", Math.round(attempt.getScore() * 100.0) / 100.0);
                    recentActivities.add(activity);
                });
        
        // Add submissions
        recentSubmissions.stream()
                .sorted((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()))
                .limit(5)
                .forEach(submission -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("type", "ASSIGNMENT_SUBMISSION");
                    activity.put("timestamp", submission.getSubmittedAt());
                    activity.put("studentName", submission.getStudent().getName());
                    activity.put("relatedEntity", submission.getAssignment().getTitle());
                    if (submission.getMarksAwarded() != null) {
                        activity.put("score", Math.round(submission.getMarksAwarded() * 100.0) / 100.0);
                    }
                    recentActivities.add(activity);
                });
        
        // Sort all activities by timestamp and take top 15
        recentActivities.sort((a, b) -> {
            LocalDateTime timeA = (LocalDateTime) a.get("timestamp");
            LocalDateTime timeB = (LocalDateTime) b.get("timestamp");
            return timeB.compareTo(timeA);
        });
        
        trends.put("recentActivities", recentActivities.stream().limit(15).collect(Collectors.toList()));
        
        return trends;
    }
}
