exports.handler = async (event, context) => {
  const mockMetrics = {
    timestamp: new Date().toISOString(),
    energy_usage: {
      current: 1420,
      target: 1800,
      efficiency: 0.79,
      savings: 380
    },
    waste_management: {
      recycled: 2450,
      total: 3200,
      percentage: 0.77
    },
    water_usage: {
      current: 8900,
      target: 12000,
      efficiency: 0.74
    },
    carbon_footprint: {
      current: 2450,
      target: 3000,
      offset: 550
    }
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(mockMetrics)
  };
};