exports.handler = async (event, context) => {
  const mockIncidents = [
    {
      id: 1,
      type: 'medical',
      severity: 'medium',
      location: 'Section B1, Row 15',
      time: new Date(Date.now() - 300000).toISOString(),
      status: 'resolved',
    },
    {
      id: 2,
      type: 'security',
      severity: 'low',
      location: 'Gate 3',
      time: new Date(Date.now() - 600000).toISOString(),
      status: 'active',
    },
    {
      id: 3,
      type: 'crowd',
      severity: 'high',
      location: 'Concourse Level 2',
      time: new Date(Date.now() - 120000).toISOString(),
      status: 'monitoring',
    },
  ];

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(mockIncidents),
  };
};
