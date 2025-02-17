import "./App.css";

const subject = "React";
/* block comment syntax */
function App(props) {
  return (
    <>
      <header>
      {/* block comment syntax */}
        <h1>{props.greeting}, {props.subject}!</h1>
        <button type = "button" className="primary">
          Click me!
        </button>
      </header>
    </>
  );
}

export default App;
