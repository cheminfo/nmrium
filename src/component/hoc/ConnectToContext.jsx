function ConnectToContext(WrappedComponent, contextData, additionalProps = {}) {
  return function (props) {
    const { data, activeSpectrum, preferences, activeTab, selectedTool } =
      contextData();

    return (
      <WrappedComponent
        data={data}
        activeSpectrum={activeSpectrum}
        preferences={preferences}
        activeTab={activeTab}
        selectedTool={selectedTool}
        {...props}
        {...additionalProps}
      />
    );
  };
}
export default ConnectToContext;
