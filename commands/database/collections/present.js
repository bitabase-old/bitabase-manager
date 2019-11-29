function presentCollection (record) {
  const collectionConfig = typeof record.schema === 'object' ? record.schema : JSON.parse(record.schema);
  delete collectionConfig.name;

  return {
    name: record.name,
    ...collectionConfig,
    statistics: {
      total_reads: record.total_reads,
      total_space: record.total_space,
      total_writes: record.total_writes
    },
    date_created: record.date_created
  };
}

module.exports = presentCollection;
