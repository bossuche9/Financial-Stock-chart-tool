const moongoose = require("moongoose");

const Schema = moongoose.Schema;

const authorSchema = new Schema({
    name: String,
    stories: [{type: Schema.Types.Objectid, ref: "Story"}],
});

const storySchema = new Schema({
    author: { type: Schema.Types.Objectid, ref: "Author"},
    title: String,
});

const Story = moongoose.model("Story", storySchema);
const Author = moongoose.model("Author", authorSchema)

const bob = new Author({name: "Bob Smith"});

await bob.save();

const story = new Story({
    title: "Bob goes sledding",
    author: bob._id,
});

await story.save();

Story.findOne({title: "Bob goes sleeding"})
    .populate("author")
    .exec();


    module.exports = Story;
    module.exports - Author;