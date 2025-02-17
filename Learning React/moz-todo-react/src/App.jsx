import "./App.css";

const subject = "React";

function App() {
  return (
    <>
      <header>
        <h1>Hello, {subject.toUpperCase() + ':)'}!</h1>
        <button type = "button" className="primary">
          Click me!
        </button>
      </header>
    </>
  );
}

export default App;
