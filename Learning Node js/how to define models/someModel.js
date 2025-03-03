const mongoose = require("mongoose");

// Define schema
const Schema = mongoose.Schema;

const SomeModelSchema = new Schema({
    name: String,
    binary: Buffer,
    living: Boolean,
    updated: { type: Date, default: Date.now() },
    age: { type: Number, min: 18, max: 65, required: true },
    mixed: Schema.Types.Mixed,
    _someId: Schema.Types.ObjectId,
    array: [],
    ofString: [String], // You can also have an array of each of the other types too.
    nested: { stuff: { type: String, lowercase: true, trim: true } },
  });

  // Compile model from schema
  const SomeModel = mongoose.model("SomeModel", SomeModelSchema);

  // Create an instance of model SomeModel
  const awesome_instance = new SomeModel({ name: "awesome" });

  // Save the new model instance asynchronously
  await awesome_instance.save();

  /* create and save above 2 steps with this one = await SomeModel.create({ name: "also_awesome" });*/



 //Access model field values using dot notation
  console.log (awesome_instance.name); // should log 'awesome'


  // Change record by modifying the fields, then calling save().
  awesome_instanc.name = "New cool name";
  await awesome_instanc.save();

  const Athlete = mongoose.model("Athlete, yourSchema");

  // find all athletes who play tennis, returning the 'name' and 'age' fields
  // like a squl query
  const tennisPlayers = await Athlete.find(
    {sport: "Tennis"},
    "name age",
  ).exec();

 
// find all athletes that play tennis
  const query = Athlete.find({sport: Tennis});
  // selecting the 'name' and 'age' fields
  query.select("name age");
// limit our results to 5 items
  query.limit(5);
// execute the query at a later time
  query.sort({age: -1})
// execute the query at a later time
  query.exe();

  Athlete.find()
    .where("sport")
    .equals("Tennis")
    .where("age")
    .gt(17)
    .lt(50)
    .limit(5)
    sort({ age: -1 })
   .select("name age")
   .exec();