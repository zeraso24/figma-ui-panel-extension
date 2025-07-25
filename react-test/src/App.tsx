import React from "react";
import { TestComponent } from "./TestComponent";
import { withSource } from "./utils/withSource";

const InstrumentedTestComponent = withSource(TestComponent, { file: "src/TestComponent.tsx", line: 3 });

function App() {
  return (
    <div>
      <h1>App</h1>
      <InstrumentedTestComponent />
    </div>
  );
}

export default App; 