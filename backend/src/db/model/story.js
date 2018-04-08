const mongoose = require('mongoose')
const { Schema } = mongoose

const Story = new Schema({
  content: String,
  title: {type:String,unique:false},
  subTitle: {type:String,unique:false},
  startDate: Date,
  endDate: Date,
  sourceLink: String,
  tags:[{}],
  author:{type: String},
  displayName:{type: String},
  images : [],
  viewCount : Number
})

Story.statics.create = function(storyInfo, author, displayName) {
  const { title, subTitle, content, startDate, endDate, sourceLink, tags, images } = storyInfo
  const story = new this({
    title : title,
    subTitle,
    content, 
    startDate, 
    endDate, 
    sourceLink, 
    tags, 
    author,
    displayName,
    images,
    viewCount : 0
  })

  return story.save()
}

module.exports = mongoose.model('Story', Story)