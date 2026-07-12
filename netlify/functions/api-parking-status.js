exports.handler = async (event, context) => {
  const mockParking = {
    timestamp: new Date().toISOString(),
    lots: [
      { id: 'P1', name: 'North Lot', capacity: 2000, available: 342, status: 'moderate' },
      { id: 'P2', name: 'South Lot', capacity: 2500, available: 124, status: 'critical' },
      { id: 'P3', name: 'East Lot', capacity: 1800, available: 856, status: 'low' },
      { id: 'P4', name: 'West Lot', capacity: 2200, available: 1102, status: 'low' },
    ],
    total: {
      capacity: 8500,
      available: 2424,
      percentage: 71,
    },
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(mockParking),
  };
};
