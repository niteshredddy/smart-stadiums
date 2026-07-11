exports.handler = async (event, context) => {
  const mockGates = {
    timestamp: new Date().toISOString(),
    gates: [
      { id: 'G1', name: 'North Gate', status: 'open', throughput: 245, queue: 12 },
      { id: 'G2', name: 'South Gate', status: 'open', throughput: 312, queue: 8 },
      { id: 'G3', name: 'East Gate', status: 'open', throughput: 198, queue: 15 },
      { id: 'G4', name: 'West Gate', status: 'maintenance', throughput: 0, queue: 0 },
      { id: 'G5', name: 'VIP Gate', status: 'open', throughput: 87, queue: 3 },
      { id: 'G6', name: 'Media Gate', status: 'open', throughput: 156, queue: 5 }
    ]
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(mockGates)
  };
};