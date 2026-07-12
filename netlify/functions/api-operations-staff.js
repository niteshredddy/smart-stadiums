exports.handler = async (event, context) => {
  const mockStaff = {
    timestamp: new Date().toISOString(),
    total_staff: 847,
    on_duty: 756,
    by_department: [
      { name: 'Security', total: 234, on_duty: 210 },
      { name: 'Medical', total: 89, on_duty: 82 },
      { name: 'Crowd Control', total: 312, on_duty: 289 },
      { name: 'Guest Services', total: 156, on_duty: 145 },
      { name: 'Maintenance', total: 56, on_duty: 30 },
    ],
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(mockStaff),
  };
};
