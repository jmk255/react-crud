import { ActivityForm, ActivityInputWrap, ImgInputWrap } from "../../styles/dashboard/activityWrite.styles";
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../App';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const ActivityCU = (props) => {
  const [formInfo, setFormInfo] = useState({
    values: {
      title: props.isEdit ? props.activity?.title : '',
      content: props.isEdit ? props.activity?.content : '',
    },
    errors: {
      title: props.isEdit ? '' : '제목은 필수 입력 값입니다.',
      content: props.isEdit ? '' : '내용은 필수 입력 값입니다.'
    },
    touched: { title: false, content: false },
  });

  const [imgList, setImgList] = useState(props.isEdit ? props.activity.img_url.map((el) => { return { id: el, previewUrl: el, originFile: null } }) : []);

  //로그인한 사람의 email 정보를 담을 변수
  const [userEmail, setUserEmail] = useState('');
  const { accessToken } = useContext(UserContext);

  const navigate = useNavigate();

  const [deleteImg, setDeleteImg] = useState([]); //삭제할 이미지들

  //로그인한 사람의 email 정보 가져오기
  useEffect(() => {
    const tmp = async () => {
      if (!accessToken) return;
      let res = await axios.get('/api/loggedInEmail', { headers: { Authorization: `Bearer ${accessToken}` } });
      setUserEmail(res.data);
    }
    tmp();
  }, [accessToken]);

  //게시물 제목 입력필드에서 포커스가 벗어날 때 호출됩니다.
  const handleBlur = (e) => {
    //JSON문자열을 JavaScript객체로 변환(원본 객체와는 독립적인 새 객체가 생성됩니다.)
    let cpy = JSON.parse(JSON.stringify(formInfo));
    //cpy.touched[title] 값을 true로 변경 
    cpy.touched[e.target.name] = true;
    //formInfo상태값을 갱
    setFormInfo(cpy);
  }


  //제목 혹은 입력시 실행되는 함수
  const handleChange = (e) => {
    console.log(e);
    //e.target.name 이 'title'이라면 formInfo.value.title 을 e.target.value로 바꿔준다.
    //e.target.name 이 'content'라면 formInfo.value.content 을 e.target.value로 바꿔준다.
    let cpy = JSON.parse(JSON.stringify(formInfo));
    let inputValue = e.target.value;
    if (e.target.name === 'title') { //사용자가 입력한 값이 title 이라면
      if (inputValue.length === 0) { // 사용자가 입력한 값이 없다면
        cpy.errors[e.target.name] = '제목은 필수 입력사항입니다.';
      } else if (inputValue.length > 30) { // 사용자가 입력한 값이 30글자 이상이라면
        cpy.errors[e.target.name] = '제목은 30글자 이하 입력해주세요.';
      } else {
        cpy.errors[e.target.name] = ''; //에러메세지를 없애준다.
      }
    } else if (e.target.name === 'content') { //사용자가 입력한 값이 content 라면
      if (inputValue.length === 0) { // 사용자가 입력한 값이 없다면
        cpy.errors[e.target.name] = '내용은 필수 입력사항입니다.';
      } else if (inputValue.length > 500) { // 사용자가 입력한 값이 1000글자 이상이라면
        cpy.errors[e.target.name] = '내용은 500글자 이하 입력해주세요.';
      } else {
        cpy.errors[e.target.name] = ''; //에러메세지를 없애준다.
      }
    }
    cpy.values[e.target.name] = inputValue;
    setFormInfo(cpy);
  }

  //글등록하기 버튼 클릭시 실행
  const handleSubmit = async (e) => {
    //새로고침 되지 않게 이벤트를 제거
    e.preventDefault();
    let cpy = JSON.parse(JSON.stringify(formInfo));
    cpy.touched.title = true;
    cpy.touched.content = true;
    setFormInfo(cpy);

    //모든 제목하고, 내용이 정상적으로 입력되었다면?
    //제목 에러메세지가 '' 이고, 내용 에러메세지가 '' 이라면? 정상적으로 모든 값이 입력됨.
    if (formInfo.errors.title === '' && formInfo.errors.content === '') {
      // alert('정상적으로 입력되었습니다. 서버로 전송합니다.');
      //서버로 전송
      //🌟1. formData 생성
      let fd = new FormData(); //formData 객체 생성
      //🌟2.이미지 파일 두개를 담아줌
      imgList.forEach((img) => { //imgList에 있는 모든 이미지를 formData에 추가해준다.
        fd.append('images', img.originFile); //image라는 이름으로 img.originFile을 "추가"해준다.
      });
      fd.append('title', formInfo.values.title);
      fd.append('content', formInfo.values.content);

      // fd 안에 images 에는 이미지 파일들이 들어있음
      //🌟수정사항이라면?
      if (props.isEdit) {
        // deleteImg.forEach((imgUrl)=> fd.append('deleteImg', imgUrl));
        //🌟문자열로 바꿔서준다 
        fd.append('deleteImg', JSON.stringify(deleteImg));
        // fd.append('deleteImg' , deleteImg);
        fd.append('id', props.activityId)

        try {
          let res = await axios.put('/api/activities', fd, { headers: { Authorization: `Bearer ${accessToken}` } });
          alert('수정 완료!');
          navigate(`/activity/${res.data.id}`, { replace: true });
        } catch (err) {
          console.log(err);
          alert('오류발생');
        }
      } else {
        try {
          let res = await axios.post('/api/activities', fd, { headers: { Authorization: `Bearer ${accessToken}` } });
          //res.data.id // 방금 추가된 게시글의 id가 들어잇다
          console.log(res.data.id);
          alert('추가완료!');
          navigate(`/activity/${res.data.id}`, { replace: true });

        } catch (err) {
          console.log(err);
          alert('err');
        }
      }
    }
  }

  const onImgSelected = (e) => {
    //이미 이미지가 업로드 되었던 것을 다시 선택해서 실행될때는 기존의 배열에서 기존의 선택된 이미지를 지우고 새로 선택한 이미지를 배열에 추가해준다.
    let now = new Date();
    let id = now.toString();

    let reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);

    reader.onload = () => {
      //console.log(reader.result); //이미지가 url로 만들어진다.
      setImgList(
        [...imgList,
        {
          id,
          previewUrl: reader.result,
          originFile: e.target.files[0]
        }
        ]);
    }
    //console.log(imgList)
  }

  const onImgChanged = (img, e) => {
    // let cpy = [...imgList];  //배열 복제 //새로운배열 생성. 객체가 들어있다. 
    //여기는 문제가 생긴다. int, string 타입이 아닌 객체가 들어있기 때문에 사용할수없음. 하지만 int, string 타입이라면 사용가능.  
    if (props.isEdit) {  //🌟 edit 일때만 delete실행
      if (!deleteImg.includes(img.id) && img.originFile === null) { // deleteImg에 img.id가 없고, img.originFile이 null이라면
        setDeleteImg([...deleteImg, img.id]); //원래 요소에다가 삭제할 이미지 배열에 추가해준다.
      }
      console.log(deleteImg)
    }

    //문자열로 바꾸고 다시 객체로 바꾸면 복제본이 생성된다.
    let cpy = JSON.parse(JSON.stringify(imgList));

    let target = cpy.find((e) => { //복제본을 넣어준다.
      return e.id === img.id;
    }); //복제본을 넣고, find 함수로 id가 같은것을 찾으면 taget이라는 이름으로 . 

    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]); //미리보기 url. 어떤url을 미리보기할건지()안에 넣어줘야한다. 그래서, e.target.files[0] --> 사용자가 업로드한 이미지 파일
    reader.onload = () => { //다 읽어지면(완료가되면) 실행되는 함수
      target.previewUrl = reader.result; //previewUrl -> 미리보기 바꾸고,
      target.originFile = e.target.files[0]; //origin -> 원본파일도 바꾸고
      setImgList(cpy); //setImgList에서, cpy원본으로 바꿔줘
      console.log(imgList)
    }
  }

  const onImgDelete = (img) => {
    setImgList(imgList.filter((e) => e.id !== img.id));
    if (img.originFile === null && props.isEdit) { //실제로 들어간 이미지 
      setDeleteImg([...deleteImg, img.id]);
    }
    console.log(deleteImg)
  }

  return (
    <section>
      <h1>{props.isEdit ? `${props.activityId}번 게시글 수정하기` : '새 게시글 작성하기'}</h1>
      <ActivityForm onSubmit={handleSubmit} >
        <ActivityInputWrap>
          <label htmlFor="title">게시글 제목</label>
          <input
            onBlur={handleBlur}
            onChange={handleChange}
            value={formInfo.values.title}
            name='title'
            id="title" />
          {formInfo.touched.title && <p>{formInfo.errors.title}</p>}
        </ActivityInputWrap>
        <ActivityInputWrap>
          <label htmlFor="writerEmail">작성자</label>
          <input disabled value={props.isEdit ? props.activity?.writer_email : props.userEmail} id="writerEmail" />
        </ActivityInputWrap>
        <ActivityInputWrap>
          <label htmlFor="content">게시글 내용</label>
          <textarea
            onBlur={handleBlur}
            onChange={handleChange}
            value={formInfo.values.content}
            name='content'
            id="content">
          </textarea>
          {formInfo.touched.content && <p>{formInfo.errors.content}</p>}
        </ActivityInputWrap>
        <ActivityInputWrap>
          <h4>이미지</h4>
          <ImgInputWrap>
            {
              imgList.map((img) =>
                <label style={{ position: 'relative' }} key={img.id}>
                  <img
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                    src={img.previewUrl} />
                  <input
                    onChange={(e) => onImgChanged(img, e)}
                    accept="image/*"
                    type="file" />
                  <button
                    style={{ position: 'absolute', top: '0', right: '0' }}
                    onClick={() => { onImgDelete(img) }}
                    type='button'>삭제하기
                  </button>
                </label>
              )
            }
            <label>
              +
              <input onChange={onImgSelected} accept="image/*" type="file" />
            </label>
          </ImgInputWrap>
          <button
            onClick={handleSubmit}
            type='button'
          >글 {props.isEdit ? '수정' : '작성'}하기</button>
        </ActivityInputWrap>
      </ActivityForm>
    </section>
  );
}

export default ActivityCU; 