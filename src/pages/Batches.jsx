import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Calendar, Clock, User, BookOpen, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const Batches = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batches, setBatches] = useState([]);
  const [student, setStudent] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({}); // session_id -> status

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Get logged-in user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Not authenticated');

        // 2. Get student record
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (studentError) throw studentError;
        if (!studentData) {
          setLoading(false);
          setError('Student profile not found. Please complete your profile.');
          return;
        }
        setStudent(studentData);

        // 3. Fetch attendance records for this student, with nested session details
        const { data: attendanceRecords, error: attendanceError } = await supabase
          .from('attendance')
          .select(`
            id,
            status,
            session_id,
            sessions!inner (
              id,
              session_date,
              start_time,
              end_time,
              batch_id,
              topic_id,
              faculty_id,
              topics (name),
              faculty!inner (
                id,
                users!inner (name)
              )
            )
          `)
          .eq('student_id', studentData.id);

        if (attendanceError) throw attendanceError;

        if (!attendanceRecords || attendanceRecords.length === 0) {
          setBatches([]);
          setLoading(false);
          return;
        }

        // Build a map of session_id -> attendance status
        const attMap = {};
        attendanceRecords.forEach(rec => {
          attMap[rec.session_id] = rec.status;
        });
        setAttendanceMap(attMap);

        // Collect unique batch IDs from sessions
        const batchIds = [...new Set(attendanceRecords.map(rec => rec.sessions.batch_id).filter(Boolean))];
        if (batchIds.length === 0) {
          setBatches([]);
          setLoading(false);
          return;
        }

        // 4. Fetch batch details, including schedules and course
        const { data: batchesData, error: batchesError } = await supabase
          .from('batches')
          .select(`
            *,
            course:course_id (name),
            schedules:batch_schedules (*)
          `)
          .in('id', batchIds);
        if (batchesError) throw batchesError;

        // 5. Organize sessions per batch
        const sessionsByBatch = {};
        attendanceRecords.forEach(rec => {
          const session = rec.sessions;
          const batchId = session.batch_id;
          if (!sessionsByBatch[batchId]) sessionsByBatch[batchId] = [];
          sessionsByBatch[batchId].push({
            id: session.id,
            date: session.session_date,
            start_time: session.start_time,
            end_time: session.end_time,
            topic: session.topics?.name || 'General',
            faculty: session.faculty?.users?.name || 'Staff',
            attendance_status: attMap[session.id],
          });
        });

        // 6. Combine batch info with sessions
        const batchesWithSessions = batchesData.map(batch => ({
          ...batch,
          sessions: sessionsByBatch[batch.id] || [],
          schedule: batch.schedules || [],
        }));

        setBatches(batchesWithSessions);
      } catch (err) {
        console.error('Error fetching batches:', err);
        setError(err.message || 'Failed to load batch information.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAttendanceIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <CheckCircle2 className="text-green-500 w-5 h-5" />;
      case 'absent':
        return <XCircle className="text-red-500 w-5 h-5" />;
      case 'leave':
        return <AlertCircle className="text-yellow-500 w-5 h-5" />;
      default:
        return <AlertCircle className="text-gray-400 w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-[#E2592D] animate-spin" />
        <span className="ml-2 text-[#555555]">Loading your batches...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-[#E2592D] text-white px-4 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#555555]">You are not enrolled in any batch yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {batches.map(batch => (
        <div key={batch.id} className="bg-white rounded-2xl shadow-md border border-[#E5E5E5] overflow-hidden">
          {/* Batch Header */}
          <div className="p-6 border-b border-[#E5E5E5] bg-[#FDE3DA]/30">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <div>
                <h2 className="text-2xl font-black text-[#1A1A1A]">{batch.name}</h2>
                <p className="text-[#555555] mt-1">Course: {batch.course?.name || 'N/A'}</p>
              </div>
              <div className="flex gap-4 text-sm text-[#555555]">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{new Date(batch.start_date).toLocaleDateString()} – {new Date(batch.end_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            {/* Schedule */}
            {batch.schedule && batch.schedule.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#555555]">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>Schedule:</span>
                </div>
                {batch.schedule.map((sch, idx) => (
                  <div key={sch.id} className="bg-white px-3 py-1 rounded-full border border-[#E5E5E5]">
                    {getDayName(sch.day_of_week)} {sch.start_time?.slice(0,5)} – {sch.end_time?.slice(0,5)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sessions Table */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Sessions & Attendance</h3>
            {batch.sessions.length === 0 ? (
              <p className="text-[#555555] italic">No sessions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#E5E5E5]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[#27403B] uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[#27403B] uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[#27403B] uppercase tracking-wider">Topic</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[#27403B] uppercase tracking-wider">Faculty</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[#27403B] uppercase tracking-wider">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {batch.sessions.map(session => (
                      <tr key={session.id} className="hover:bg-[#FFF6F2]">
                        <td className="px-4 py-3 text-sm text-[#1A1A1A]">{new Date(session.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-[#1A1A1A]">{session.start_time?.slice(0,5)} – {session.end_time?.slice(0,5)}</td>
                        <td className="px-4 py-3 text-sm text-[#1A1A1A]">{session.topic}</td>
                        <td className="px-4 py-3 text-sm text-[#1A1A1A]">{session.faculty}</td>
                        <td className="px-4 py-3 text-sm flex items-center gap-2">
                          {getAttendanceIcon(session.attendance_status)}
                          <span className="capitalize">{session.attendance_status || 'N/A'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper to convert day_of_week number (0 = Sunday, 1 = Monday, ...) to name
const getDayName = (dayNum) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNum] || '';
};

export default Batches;