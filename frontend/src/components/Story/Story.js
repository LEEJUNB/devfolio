import React from 'react'
import styles from './Story.scss'
import { Link } from "react-router-dom"
import classNames from 'classnames/bind'
import FroalaEditorView from 'react-froala-wysiwyg/FroalaEditorView'
// import FroalaEditor from 'react-froala-wysiwyg'
// Require Editor JS files.
import 'froala-editor/js/froala_editor.pkgd.min.js'
// Require Editor CSS files.
import 'froala-editor/css/froala_style.min.css'
import 'froala-editor/css/froala_editor.pkgd.min.css'
// Require Font Awesome.
import 'font-awesome/css/font-awesome.css'

const cx = classNames.bind(styles)

const Story = ({story,curUserName}) => {
  console.log(story);
  return(
    <div className={cx('showBox')}>
      <p>{curUserName}</p>
      <p className={cx('title')}>{story.title}</p>
      <FroalaEditorView
        className={cx('FroalaViewerA')}
        model = {story.content}
      />
      {/* 현재유저와 게시글작성자가 일치하면 수정버튼 랜더링 */}
      {story.displayName == curUserName? <Link to={`/newstory/${story._id}`} >수정</Link> : null}
    </div>
  )
}

export default Story