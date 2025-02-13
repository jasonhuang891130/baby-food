import React, { useState, useEffect } from 'react';
import { X, Trash2, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';

interface FoodLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FoodLog {
  id: string;
  created_at: string;
  plan_details: {
    age: string;
    height: string;
    weight: string;
    sex: string;
    goals?: string;
    mealCount: string;
    allergies: string[];
    dietary?: string;
    plan: string;
  };
}

export function FoodLogsModal({ isOpen, onClose }: FoodLogsModalProps) {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  const fetchLogs = async () => {
    try {
      const { data: foodLogs, error } = await supabase
        .from('food_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLogs(foodLogs || []);
    } catch (error) {
      setError('Failed to load food logs');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLogs(logs.filter(log => log.id !== id));
    } catch (error) {
      console.error('Error deleting log:', error);
      setError('Failed to delete log');
    }
  };

  const downloadLog = (log: FoodLog) => {
    const doc = new jsPDF();
    const lineHeight = 7;
    let yPos = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Baby Food Plan', pageWidth / 2, yPos, { align: 'center' });
    yPos += lineHeight * 2;

    // Created date
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Created: ${new Date(log.created_at).toLocaleString()}`, margin, yPos);
    yPos += lineHeight * 2;

    // Details section
    doc.setFont('helvetica', 'bold');
    doc.text('Baby Details:', margin, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'normal');
    const details = [
      `Age: ${log.plan_details.age} months`,
      `Height: ${log.plan_details.height} cm`,
      `Weight: ${log.plan_details.weight} kg`,
      `Sex: ${log.plan_details.sex}`,
      log.plan_details.goals ? `Goals: ${log.plan_details.goals}` : null,
      `Meals per day: ${log.plan_details.mealCount}`,
      `Allergies: ${log.plan_details.allergies.join(', ') || 'None'}`,
      `Dietary Preference: ${log.plan_details.dietary || 'No specific preference'}`
    ].filter(Boolean);

    details.forEach(detail => {
      if (detail) {
        doc.text(detail, margin, yPos);
        yPos += lineHeight;
      }
    });

    yPos += lineHeight;

    // Plan section
    doc.setFont('helvetica', 'bold');
    doc.text('Food Plan:', margin, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'normal');
    const splitPlan = doc.splitTextToSize(log.plan_details.plan, pageWidth - (margin * 2));
    
    // Check if we need a new page
    if (yPos + (splitPlan.length * lineHeight) > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
    }

    doc.text(splitPlan, margin, yPos);

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(10);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    const fileName = `baby-food-plan-${new Date(log.created_at).toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full p-6 relative max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Baby Food Logs</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No food plans saved yet. Generate a plan to see it here!
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="bg-yellow-50 rounded-lg p-4 relative hover:shadow-md transition-shadow">
                <div className="absolute right-4 top-4 flex gap-2">
                  <button
                    onClick={() => downloadLog(log)}
                    className="text-gray-500 hover:text-yellow-600 transition-colors"
                    title="Download plan as PDF"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete plan"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-500">
                    Created on {new Date(log.created_at).toLocaleDateString()}
                  </div>
                  <div className="font-medium">
                    {log.plan_details.age} months old {log.plan_details.sex}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Details</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>Height: {log.plan_details.height} cm</li>
                      <li>Weight: {log.plan_details.weight} kg</li>
                      <li>Meals: {log.plan_details.mealCount}/day</li>
                      {log.plan_details.goals && (
                        <li>Goals: {log.plan_details.goals}</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Dietary Info</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>Allergies: {log.plan_details.allergies.join(', ') || 'None'}</li>
                      <li>Diet: {log.plan_details.dietary || 'Standard'}</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">Food Plan</div>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {log.plan_details.plan}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}