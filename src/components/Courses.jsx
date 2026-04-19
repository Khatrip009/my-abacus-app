import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Target, ChevronRight, Loader2, GraduationCap, CheckCircle2 } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Fetch all courses (RLS must allow public read)
      let { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*');

      if (coursesError) throw coursesError;

      // Filter active locally
      if (coursesData && Array.isArray(coursesData)) {
        coursesData = coursesData.filter(course => course.status === 'active');
      } else {
        coursesData = [];
      }

      // Fetch objectives for each course
      const coursesWithObjectives = await Promise.all(
        coursesData.map(async (course) => {
          const { data: objectives, error: objError } = await supabase
            .from('course_objectives')
            .select('objective_text, order_no')
            .eq('course_id', course.id)
            .order('order_no', { ascending: true });

          if (objError) console.error(`Error fetching objectives for ${course.id}`, objError);
          return { ...course, objectives: objectives || [] };
        })
      );

      setCourses(coursesWithObjectives);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  if (loading) {
    return (
      <section className="w-full bg-gradient-to-b from-white to-[#FFF6F2] py-16 md:py-24">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#E2592D] animate-spin inline-block" />
          <span className="ml-2 text-[#555555]">Loading programs...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full bg-gradient-to-b from-white to-[#FFF6F2] py-16 md:py-24">
        <div className="text-center text-red-600">
          <p>Unable to load courses. Please try again later.</p>
          <p className="text-sm">Error: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gradient-to-b from-white to-[#FFF6F2] py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-[#FDE3DA] rounded-full px-4 py-2 mb-4">
            <GraduationCap className="w-4 h-4 text-[#E2592D]" />
            <span className="text-sm font-bold text-[#27403B] uppercase tracking-wide">Our Programs</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#1A1A1A] mb-4">
            Transform Your Child's <span className="text-[#27403B]">Future</span>
          </h2>
          <p className="text-lg text-[#555555] max-w-2xl mx-auto">
            Scientifically designed programs for holistic brain development
          </p>
        </div>

        {/* Centered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 justify-items-center">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group w-full max-w-md bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#E5E5E5] hover:border-[#E2592D] overflow-hidden flex flex-col"
            >
              {/* Product Card Image Area */}
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#FDE3DA] to-[#FFF6F2]">
                {course.primary_image ? (
                  <img
                    src={course.primary_image}
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-20 h-20 text-[#E2592D] opacity-30" />
                  </div>
                )}
                {course.logo && (
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-md p-1">
                    <img src={course.logo} alt="logo" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-black text-[#1A1A1A] mb-2 group-hover:text-[#E2592D] transition-colors">
                  {course.name}
                </h3>
                <p className="text-[#555555] text-sm leading-relaxed mb-4">
                  {course.description}
                </p>

                {/* Objectives */}
                {course.objectives && course.objectives.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-[#27403B] font-bold text-sm mb-2">
                      <Target className="w-4 h-4" />
                      <span>What you'll learn:</span>
                    </div>
                    <ul className="space-y-1">
                      {course.objectives.slice(0, 2).map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-[#555555]">
                          <CheckCircle2 className="w-4 h-4 text-[#E2592D] flex-shrink-0 mt-0.5" />
                          <span>{obj.objective_text}</span>
                        </li>
                      ))}
                    </ul>
                    {course.objectives.length > 2 && (
                      <button
                        onClick={() => toggleExpand(course.id)}
                        className="mt-2 text-[#E2592D] text-sm font-semibold hover:text-[#C94E26] transition flex items-center gap-1"
                      >
                        {expandedCourse === course.id ? 'Show less' : `+ ${course.objectives.length - 2} more`}
                        <ChevronRight className={`w-4 h-4 transition-transform ${expandedCourse === course.id ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </div>
                )}

                {/* Expanded Objectives */}
                {expandedCourse === course.id && course.objectives.length > 2 && (
                  <ul className="mt-2 mb-4 space-y-1 border-t border-[#E5E5E5] pt-2">
                    {course.objectives.slice(2).map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[#555555]">
                        <CheckCircle2 className="w-4 h-4 text-[#E2592D] flex-shrink-0 mt-0.5" />
                        <span>{obj.objective_text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA Button */}
                <button className="w-full mt-auto bg-[#E2592D] hover:bg-[#C94E26] text-white font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-md">
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Fallback */}
        {courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#555555]">No courses available at the moment. Please check back later.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Courses;