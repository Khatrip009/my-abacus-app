import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  ChevronRight, ChevronDown, BookOpen, Book, Layers, 
  FileText, Loader2, Sparkles, GraduationCap, Search 
} from 'lucide-react';

const CurriculumExplorer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch courses (active only)
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('status', 'active');
        if (coursesError) throw coursesError;

        // For each course, fetch its books
        const coursesWithBooks = await Promise.all(
          coursesData.map(async (course) => {
            const { data: books, error: booksError } = await supabase
              .from('books')
              .select('*')
              .eq('course_id', course.id)
              .order('order_no', { ascending: true });
            if (booksError) throw booksError;

            // For each book, fetch chapters
            const booksWithChapters = await Promise.all(
              books.map(async (book) => {
                const { data: chapters, error: chaptersError } = await supabase
                  .from('chapters')
                  .select('*')
                  .eq('book_id', book.id)
                  .order('order_no', { ascending: true });
                if (chaptersError) throw chaptersError;

                // For each chapter, fetch topics
                const chaptersWithTopics = await Promise.all(
                  chapters.map(async (chapter) => {
                    const { data: topics, error: topicsError } = await supabase
                      .from('topics')
                      .select('*')
                      .eq('chapter_id', chapter.id)
                      .order('order_no', { ascending: true });
                    if (topicsError) throw topicsError;
                    return { ...chapter, topics };
                  })
                );
                return { ...book, chapters: chaptersWithTopics };
              })
            );
            return { ...course, books: booksWithChapters };
          })
        );

        setCourses(coursesWithBooks);
      } catch (err) {
        console.error('Error fetching curriculum:', err);
        setError('Failed to load curriculum. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Toggle expand/collapse for any node
  const toggleExpand = (id, level) => {
    const key = `${level}-${id}`;
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Recursive render function
  const renderTree = () => {
    const filteredCourses = courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredCourses.length === 0 && searchTerm) {
      return <p className="text-center text-[#555555] py-8">No courses match your search.</p>;
    }

    return filteredCourses.map(course => (
      <div key={course.id} className="mb-6">
        {/* Course Header */}
        <div
          className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-[#E5E5E5] cursor-pointer hover:shadow-md transition"
          onClick={() => toggleExpand(course.id, 'course')}
        >
          <div className="text-[#E2592D]">
            {expanded[`course-${course.id}`] ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </div>
          <GraduationCap className="w-5 h-5 text-[#E2592D]" />
          <span className="font-black text-lg text-[#1A1A1A]">{course.name}</span>
          <span className="text-xs text-[#555555] ml-auto">
            {course.books?.length || 0} books
          </span>
        </div>

        {/* Course Children (Books) */}
        {expanded[`course-${course.id}`] && (
          <div className="ml-6 mt-2 pl-4 border-l-2 border-[#FDE3DA] space-y-2">
            {course.books?.map(book => (
              <div key={book.id}>
                {/* Book Header */}
                <div
                  className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#E5E5E5] cursor-pointer hover:bg-[#FDE3DA] transition"
                  onClick={() => toggleExpand(book.id, 'book')}
                >
                  {expanded[`book-${book.id}`] ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                  <Book className="w-4 h-4 text-[#27403B]" />
                  <span className="font-bold text-[#27403B]">{book.name}</span>
                  <span className="text-xs text-[#555555] ml-auto">
                    {book.chapters?.length || 0} chapters
                  </span>
                </div>

                {/* Book Children (Chapters) */}
                {expanded[`book-${book.id}`] && (
                  <div className="ml-6 mt-2 pl-4 border-l-2 border-[#FDE3DA] space-y-2">
                    {book.chapters?.map(chapter => (
                      <div key={chapter.id}>
                        {/* Chapter Header */}
                        <div
                          className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#E5E5E5] cursor-pointer hover:bg-[#FDE3DA] transition"
                          onClick={() => toggleExpand(chapter.id, 'chapter')}
                        >
                          {expanded[`chapter-${chapter.id}`] ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                          <Layers className="w-4 h-4 text-[#E2592D]" />
                          <span className="font-semibold text-[#1A1A1A]">
                            {chapter.name} (Chapter {chapter.chapter_no})
                          </span>
                          <span className="text-xs text-[#555555] ml-auto">
                            {chapter.topics?.length || 0} topics
                          </span>
                        </div>

                        {/* Chapter Children (Topics) */}
                        {expanded[`chapter-${chapter.id}`] && (
                          <div className="ml-6 mt-2 pl-4 border-l-2 border-[#FDE3DA] space-y-1">
                            {chapter.topics?.map(topic => (
                              <div
                                key={topic.id}
                                className="flex items-center gap-2 p-2 pl-4 rounded-lg hover:bg-[#FFF6F2] cursor-pointer transition group"
                                onClick={() => navigate(`/topics/${topic.id}`)}
                              >
                                <FileText className="w-4 h-4 text-[#555555] group-hover:text-[#E2592D]" />
                                <span className="text-[#555555] group-hover:text-[#E2592D]">
                                  {topic.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6F2]" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <Loader2 className="w-8 h-8 text-[#E2592D] animate-spin" />
        <span className="ml-2 text-[#555555]">Loading your learning journey...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6F2]" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#E2592D] text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FFF6F2] py-8 px-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#FDE3DA] rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#E2592D]" />
            <span className="text-sm font-bold text-[#27403B] uppercase tracking-wide">Your Learning Path</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1A1A1A]">
            Explore Your <span className="text-[#E2592D]">Curriculum</span>
          </h1>
          <p className="text-[#555555] mt-2">Click to expand and start learning</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#BFC8C6] w-5 h-5" />
          <input
            type="text"
            placeholder="Search for a course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2592D]"
          />
        </div>

        {/* Tree View */}
        <div className="bg-white/50 rounded-2xl p-4 shadow-sm">
          {renderTree()}
        </div>
      </div>
    </div>
  );
};

export default CurriculumExplorer;