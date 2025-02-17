import "./App.css";

const subject = "React";
/* block comment syntax */
function App() {
  return (
    <>
      <header>
      {/* block comment syntax */}
        <h1>Hello, {subject.toUpperCase() + ':)'}!</h1>
        <button type = "button" className="primary">
          Click me!
        </button>
      </header>
    </>
  );
}

export default App;
