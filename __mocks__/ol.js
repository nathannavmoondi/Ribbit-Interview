// Minimal OpenLayers mock for tests so components can import without executing real map code.
module.exports = {
  Map: function MockedMap() { return { on: () => {}, getView: () => ({ calculateExtent: () => [0,0,0,0] }), getSize: () => [100,100], getViewport: () => ({ addEventListener: () => {} }), getTargetElement: () => ({ style: {} }) }; },
  View: function MockedView() {},
};