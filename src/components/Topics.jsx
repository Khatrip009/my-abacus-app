import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Loader2, ArrowLeft, ChevronLeft, ChevronRight, 
  BookOpen, Layers, FileText, Video, Image as ImageIcon,
  ExternalLink, Lightbulb, Target, AlertCircle, GraduationCap
} from 'lucide-react';

const Topics = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topic, setTopic] = useState(null);
  const [contents, setContents] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [book, setBook] = useState(null);
  const [prevTopicId, setPrevTopicId] = useState(null);
  const [nextTopicId, setNextTopicId] = useState(null);

  useEffect(() => {
    if (!topicId) return;
    fetchTopicData();
  }, [topicId]);

  const fetchTopicData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch topic details
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('*, chapter:chapter_id(*)')
        .eq('id', topicId)
        .single();
      if (topicError) throw topicError;
      setTopic(topicData);
      setChapter(topicData.chapter);

      // 2. Fetch chapter's book
      if (topicData.chapter?.book_id) {
        const { data: bookData, error: bookError } = await supabase
          .from('books')
          .select('*, course:course_id(*)')
          .eq('id', topicData.chapter.book_id)
          .single();
        if (!bookError && bookData) setBook(bookData);
      }

      // 3. Fetch topic contents (ordered by order_no)
      const { data: contentsData, error: contentsError } = await supabase
        .from('topic_contents')
        .select('*')
        .eq('topic_id', topicId)
        .order('order_no', { ascending: true });
      if (contentsError) throw contentsError;
      setContents(contentsData || []);

      // 4. Fetch previous/next topics in the same chapter (by order_no)
      if (topicData.chapter_id) {
        const { data: siblings, error: siblingsError } = await supabase
          .from('topics')
          .select('id, order_no')
          .eq('chapter_id', topicData.chapter_id)
          .order('order_no', { ascending: true });
        if (!siblingsError && siblings) {
          const currentIdx = siblings.findIndex(t => t.id === topicId);
          if (currentIdx > 0) setPrevTopicId(siblings[currentIdx - 1].id);
          if (currentIdx < siblings.length - 1) setNextTopicId(siblings[currentIdx + 1].id);
        }
      }
    } catch (err) {
      console.error('Error fetching topic:', err);
      setError('Unable to load topic content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (item) => {
    // Handle example type with JSON data
    if (item.content_type === 'example' && item.content_json) {
      const example = item.content_json;
      return (
        <div className="bg-[#FFF6F2] rounded-xl p-5 border border-[#FDE3DA]">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-[#E2592D]" />
            <h3 className="font-bold text-lg text-[#1A1A1A]">Example: {example.question}</h3>
          </div>
          <p className="text-[#555555] mb-2"><strong>Method:</strong> {example.method}</p>
          <div className="mt-2">
            <p className="font-semibold text-[#27403B] mb-1">Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-[#555555]">
              {example.steps?.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
          <p className="mt-3 text-lg font-bold text-[#E2592D]">Answer: {example.answer}</p>
        </div>
      );
    }

    // Plain text content types (explanation, rule, instruction, text)
    if (['explanation', 'rule', 'instruction', 'text'].includes(item.content_type) && item.content_text) {
      let icon = null;
      let bgClass = '';
      switch (item.content_type) {
        case 'explanation':
          icon = <BookOpen className="w-5 h-5 text-[#E2592D]" />;
          bgClass = 'bg-white';
          break;
        case 'rule':
          icon = <AlertCircle className="w-5 h-5 text-[#E2592D]" />;
          bgClass = 'bg-[#FDE3DA]/30 border-l-4 border-[#E2592D]';
          break;
        case 'instruction':
          icon = <Lightbulb className="w-5 h-5 text-[#E2592D]" />;
          bgClass = 'bg-[#FFF6F2]';
          break;
        default:
          icon = <FileText className="w-5 h-5 text-[#555555]" />;
      }
      return (
        <div className={`p-4 rounded-lg ${bgClass}`}>
          {icon && <div className="mb-2">{icon}</div>}
          <p className="text-[#555555] leading-relaxed">{item.content_text}</p>
        </div>
      );
    }

    // Video content
    if (item.content_type === 'video') {
      const videoId = extractYouTubeId(item.content_text);
      if (videoId) {
        return (
          <div className="aspect-video rounded-lg overflow-hidden shadow-md">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Video content"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        );
      }
      return (
        <a
          href={item.content_text}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#E2592D] hover:underline"
        >
          <Video size={18} /> Watch Video <ExternalLink size={14} />
        </a>
      );
    }

    // Image content
    if (item.content_type === 'image') {
      return (
        <img
          src={item.content_text}
          alt="Topic illustration"
          className="max-w-full rounded-lg shadow-md"
        />
      );
    }

    // Fallback for unsupported types
    return (
      <div className="text-[#555555] italic p-4 border-l-4 border-gray-300">
        Content type "{item.content_type}" is not yet supported.
      </div>
    );
  };

  // Helper to extract YouTube video ID from various URL formats
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6F2]" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <Loader2 className="w-8 h-8 text-[#E2592D] animate-spin" />
        <span className="ml-2 text-[#555555]">Loading content...</span>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6F2]" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <p className="text-red-500 mb-4">{error || 'Topic not found'}</p>
          <button
            onClick={() => navigate('/curriculum')}
            className="bg-[#E2592D] text-white px-6 py-2 rounded-lg hover:bg-[#C94E26] transition"
          >
            Back to Curriculum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FFF6F2]" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs & Navigation */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/curriculum')}
            className="inline-flex items-center gap-2 text-[#555555] hover:text-[#E2592D] transition"
          >
            <ArrowLeft size={18} /> Back to Curriculum
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#E5E5E5]">
          {/* Header with breadcrumbs */}
          <div className="p-6 border-b border-[#E5E5E5] bg-[#FDE3DA]/30">
            <div className="flex flex-wrap gap-2 text-sm text-[#555555] mb-2">
              {book && (
                <>
                  <span className="font-semibold text-[#27403B]">{book.name}</span>
                  <span className="text-[#BFC8C6]">/</span>
                </>
              )}
              {chapter && (
                <>
                  <span className="font-semibold text-[#27403B]">{chapter.name}</span>
                  <span className="text-[#BFC8C6]">/</span>
                </>
              )}
              <span className="font-bold text-[#E2592D]">Topic {topic.topic_no}</span>
            </div>
            <h1 className="text-3xl font-black text-[#1A1A1A]">{topic.name}</h1>
          </div>

          {/* Content area */}
          <div className="p-6 space-y-8">
            {contents.length === 0 ? (
              <p className="text-[#555555] italic">No content available for this topic yet.</p>
            ) : (
              contents.map((item, idx) => (
                <div key={item.id} className="border-l-4 border-[#E2592D] pl-4">
                  {renderContent(item)}
                </div>
              ))
            )}
          </div>

          {/* Navigation between topics */}
          <div className="p-6 border-t border-[#E5E5E5] flex justify-between">
            <button
              onClick={() => prevTopicId && navigate(`/topics/${prevTopicId}`)}
              disabled={!prevTopicId}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                prevTopicId
                  ? 'text-[#E2592D] hover:bg-[#FDE3DA]'
                  : 'text-[#BFC8C6] cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={20} /> Previous Topic
            </button>
            <button
              onClick={() => nextTopicId && navigate(`/topics/${nextTopicId}`)}
              disabled={!nextTopicId}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                nextTopicId
                  ? 'text-[#E2592D] hover:bg-[#FDE3DA]'
                  : 'text-[#BFC8C6] cursor-not-allowed'
              }`}
            >
              Next Topic <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topics;