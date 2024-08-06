const express = require('express');
const app = express();
const port = 5000;
const dotenv = require('dotenv')
dotenv.config({ path: '../.env.local' });
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(express.json()); //express에 내장되있으니 바로 사용가능

app.get('/api/employees', (req, res) => {
  // mysql 에서 employees 테이블의 모든 데이터(행,컬럼)를 조회.
  pool.query('SELECT * FROM employees', (err, rows, fields) => {
    // console.log('rows', rows); 우리가필요한 데이터
    // console.log('fields', fields); 거의 쓸일없음
    res.json(rows);//응답할래, json형태로  rows(데이터를)넣어서
  });
});

// "/api" 주소로 get 요청(req)이 오면 data 에 'Hello World!'응답(res) send 한다.
app.get('/api', (req, res) => {
  res.send('Hello World!');
});

app.post('/api/users', async (req, res) => {
  console.log('req.body', req.body);
  const sql = `INSERT INTO tbl_users
    (email, pw, question, answer)
    VALUES (?, ?, ?, ?)`;

  let { email, password, question, answer } = req.body;

  let enpw = bcrypt.hashSync(password, 10);

  try {
    let [result, fields] = await pool.query(sql, [email, enpw, question, answer]);
    console.log('result', result);
    console.log('fields', fields);
    res.json("성공이야~!!");
  } catch (err) {
    if (err.errno === 1406) {
      res.status(400).json({ errCode: 1, errMsg: '아이디가 너무 길어요' });
    }
    else if (err.errno === 1062) {
      res.status(400).json({ errCode: 2, errMsg: '중복된 아이디가 존재합니다.' });
    }
    else {
      console.log(err)
      res.status(400).json({ errCode: 3, errMsg: '알수없는 에러가 발생했습니다.' });
    }
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // mysql에서 해당 email 존재하는지
  try {
    let sql = 'SELECT email, pw FROM tbl_users WHERE email=?';
    const [rows, fields] = await pool.query(sql, [email]);
    console.log(rows);

    if (rows.length === 0) {
      res.status(404).json('로그인 실패!');
      return;
    }

    if (!bcrypt.compareSync(password, rows[0].pw)) {
      res.status(404).json('로그인 실패!');
      return;
    }

    const accessToken = jwt.sign({ email: rows[0].email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log(accessToken);

    res.json({ accessToken });

  } catch (err) {
    res.status(500).json('mysql에서 오류발생');
  }
})

// /api/loggedInEmail 엔드포인트 처리
app.get('/api/loggedInEmail', (req, res) => {
  //리액트로부터 전달받은 토큰이 정삭적인지 확인하고
  //정상적이지 않으면 오류로 응답
  //정상적이면 email주소로 응답
  //토큰은 요청 header의 Authorization에 Bearer 토큰값

  console.log(req.headers.authorization)
  // 문자열로 받음
  const token = req.headers.authorization.replace('Bearer ', '');
  //앞에 Bearer 빠지고 순수 토큰 발급됨

  // console.log(token);
  // token은 로그인 당시 발급 받은 토큰

  try {
    let result = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(result);

    res.send(result.email);

  } catch (err) {
    console.log(err);
    res.status(403).json('오류발생!');
  }
});

app.get('/api/users/:email', async (req, res) => { //:email 이라고 쓰면 email이라는 변수로 사용가능 (동적으로 요청)
  // console.log(req.params);
  const email = req.params.email;
  let sql = `
    SELECT email, date_format(created_date, '%Y년 %m월 %d일') created_date, date_format(updated_date, '%Y년 %m월 %d일') updated_date, profile_url, cover_url
    from tbl_users
    WHERE email = ?
  `;
  try {
    let [rows, fields] = await pool.query(sql, [email]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json('서버 오류 발생');
  }
});

app.get('/api/career', async (req, res) => {
  try {
    let sql = `select id, 
    email,
    company, 
    position, 
    date_format(start_date, '%Y년 %m월 %d일') start_date,
    date_format(end_date, '%Y년 %m월 %d일') end_date 
    from tbl_careers
    where email = ?
    `

    //token을 받아온다. req 안에있는 headers에 authorization.
    let token = req.headers.authorization.replace('Bearer ', '');
    // 그 token안에서 email만 쓰겠다. 
    let { email } = jwt.verify(token, process.env.JWT_SECRET);

    // mysql가서 커리어 리스트 받아오고 , email이 일치하는 커리어만 받아오기
    let [results, fields] = await pool.query(sql, [email]); //sql 실행할건데, 로그인한사람의 email을 넣어서 보여주세요.
    // 리액트한테 받아온 배열 응답하기
    res.json(results);
  } catch (err) {
    console.log(err);
    res.status(500).json('서버쪽 오류 발생');
  }
});

//career 추가
app.post('/api/career', async (req, res) => {
  // email은 header에 있는 token 에 들어있음
  const token = req.headers.authorization.replace('Bearer ', '');
  let { email } = jwt.verify(token, process.env.JWT_SECRET)

  const { company, position, startDate, endDate } = req.body;

  let sql = `
    insert into tbl_careers (email, company, position, start_date, end_date)
    values
    (
      ?, 
      ?, 
      ?, 
      str_to_date(?, '%Y-%m-%d'), 
      ${endDate === '' ? null : `str_to_date(?, '%Y-%m-%d')`}
    );
  `;

  let values = [email, company, position, startDate];
  if (endDate !== '') {
    values.push(endDate);
    //endDate가 비어있는 문자열이 아닐떄만, values 에 추가해줘 endDate를
  }

  try { //성공했을때
    let [results] = await pool.query(sql, values);

    console.log(results);
    let [rows] = await pool.query('select * from tbl_careers WHERE  id=?', [results.insertId])
    console.log(rows);
    //추가 되는 커리어 정보는 배열에 담겨지므로 배열안의 객체만 전달하려면 해당 객체만 선택하여야 함
    res.json(rows[0]);

  } catch (err) { //실패했을때
    console.log(err);
    res.status(500).json('서버에서 오류 발생함');
  }
});

app.delete('/api/career', async (req, res) => {
  const { id } = req.body; //react에서 받아온 body
  //삭제할 행 id 는 id에 들어있음
  let sql = `DELETE FROM tbl_careers WHERE id=?`;

  try {
    await pool.query(sql, [id]);
    //console.log(results);
    res.json('삭제 완료!'); // 삭제를 성공하면,
  } catch (err) {
    // console.log(err);
    res.status(500).json('서버에서 오류 발생함');
  }
});

app.put('/api/careers', async (req, res) => {
  //react에서 넘겨준 값들(수정값들)
  console.log(req.body); //body안에는 {company: 'starbuck' , position: 'barista', startDate: '2022-01-01', endDate: '2023-01-01' } 가 들어있다. 
  const { company, position, startDate, endDate, id } = req.body;  //req.body 안에서 꺼내올, company, position, startDate, endDate, id를 적는다. 

  // 로그인 유저가 요청했는지 여부 검사
  console.log(req.headers.authorization);
  let token = req.headers.authorization.replace('Bearer ', ''); //토큰을 가져오고. -> 여기서, req.headers.authorization
  try {
    jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    res.status(403).json('토큰이 만료되었으니 다시 로그인 필요');
    return;
  }

  // 정상적인 토큰이라면 mysql 가서 수정 요청
  let sql = `
    UPDATE tbl_careers
    SET company = ?, position= ?, start_date = ?, end_date= ?
    WHERE id = ?
  `;
  try {
    await pool.query(sql, [company, position, startDate, endDate, id]);
    res.send('수정 완료!');
  } catch (err) {
    console.log(err);
    res.status(500).json('오류 발생함!');
  }
});

// activities get요청(게시글 목록 조회)
// 몇페이지? 몇개? 정렬순서? 리액트가 알려주면 그만큼만 가져올것
app.get('/api/activities', async (req, res) => {
  console.log(req.query);// {order:'', limit:'', page:'', q:''}
  let { order, limit, page, q } = req.query;
  limit = Number(limit);
  page = Number(page);
  // order "dateDesc"'dateAsc''like' 'view'
  // sql 
  let sql = `
    select c.id,
        c.title,
        c.content,
        c.writer_email,
        c.created_date,
        c.updated_date,
        c.activity_view,
        c.activity_like,
        if(d.email is null, 'no', 'yes') "liked"
    from (
      select a.id, 
        a.title,
        a.content,
        a.writer_email,
        a.created_date,
        a.updated_date,
        a.activity_view,
        IFNULL(b.like, 0) "activity_like"
      from tbl_activities a 
      left outer join (
        select activity_id, count(*) "like"
        from tbl_activity_like
        group by activity_id
      ) b
      on a.id = b.activity_id
    ) c
    left outer join (
      select * from tbl_activity_like
      where email = ?
    ) d
    on c.id = d.activity_id
    where title like ?
  `;

  try {

    if (order === 'view') {
      sql += 'order by activity_view desc';
    } else if (order === 'like') {
      sql += 'order by activity_like desc';
    } else if (order === 'dateAsc') {
      sql += 'order by created_date asc';
    } else {
      sql += 'order by created_date desc';
    }
    sql += ' limit ? offset ?';
    // limit에는 한페이지당 볼 갯수 2

    // 로그인 한 사람의 이메일 정보
    const token = req.headers.authorization.replace('Bearer ', '');
    const user = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(user);

    // page 에는 볼 페이지 1 --> 0  2 --> 2 3 --> 4
    let [results] = await pool.query(sql, [user.email, `%${q}%`, limit, limit * (page - 1)]);

    //각 게시물에 대한 이미지 가져오기
    sql = `
    select img_url
    from tbl_activity_img
    where activity_id = ?
    `
    //각각의 게시물 이미지 url을 각 객체속에 추가 
    for (let i = 0; i < results.length; i++) {
      let [imgs] = await pool.query(sql, [results[i].id])
      //console.log(imgs);
      results[i].img_url = imgs.map((el) => el.img_url); // img_url의 새로운 키값이 만들어짐. 배열을 img에 대입.
    }
    console.log(results); //img_url 추가된 results

    // 전체게시물 갯수
    sql = `
      select count(*) "total_cnt" 
      from tbl_activities
      where title like ?
    `;
    const [results2] = await pool.query(sql, [`%${q}%`]);
    //console.log(results2); // [ {total_cnt: 5} ]

    res.json({ total_cnt: results2[0].total_cnt, activityList: results }); //json 으로 써서 리액트한테 보내주겠다.

  } catch (err) {
    console.log(err);
    res.status(500).json('오류발생했음');
  }
});

app.get('/api/activities/:id', async (req, res) => {
  const id = req.params.id; // 리액트가 준 게시물 id
  // console.log(id);
  const token = req.headers.authorization.replace('Bearer ', '');
  const user = jwt.verify(token, process.env.JWT_SECRET);

  let sql = `
  select * from
  tbl_activities
  where id = ?
  `; //조회수까지나옴

  try {
    let [result1] = await pool.query(sql, [id]);

    //현재조회수에서 더하기 1 한값을 구해줘.
    sql = `
      update tbl_activities
      set activity_view = ?
      where id = ?;
    `;
    //result[0].activity_view 👉 현재조회수를 뜻함
    await pool.query(sql, [result1[0].activity_view + 1, id]);

    //좋아요갯수
    sql = `
          select count(*) "activity_like"
          from tbl_activity_like
          where activity_id = ?;
      `;

    let [result2] = await pool.query(sql, [id]);

    //하트를 누른지 안누른지 확인여부 & 로그인한 사람이 있다면, 결과가 있고, 아니면 없을것이다.        
    sql = `
	        select * from tbl_activity_like
	        where activity_id = ? and email = ?;
      `;

    let [result3] = await pool.query(sql, [id, user.email]);

    //이미지url
    sql = `
          select * from tbl_activity_img
          where activity_id = ? 
      `;

    let [result4] = await pool.query(sql, [id]);

    //🌟 다 하나하나 만들고 이제, 하나로 합친다.
    result1[0].activity_like = result2[0].activity_like; //result2는 좋아요갯수를 가져옴. 가져온것을 result1안에 넣어준다. 
    result1[0].liked = result3.length === 0 ? 'no' : 'yes'; //좋아요눌렀는지 안눌렀는지 여부는 result3에.
    result1[0].img_url = result4.map((el) => el.img_url) //이미지 url


    result1[0].owner = result1[0].writer_email === user.email;

    //console.log(result1[0]);

    // 모두다 result1[0] 에 넣어주고 리액트로 보낸다.   
    res.json(result1[0]);
  } catch {
    res.status(500).json('오류발생했음');
  }
});

//multer 라이브러리 설정하기
const multer = require('multer');
const uuid = require('uuid')

const upload = multer({
  storage: multer.diskStorage({ //diskStorage에 저장.
    destination: (req, file, cb) => { //어디 경로에 저장할지
      cb(null, '../public/images/'); //업로드할 경로를 써준다.
    },
    filename: (req, file, cb) => { //파일을 어떤이름으로 저장할지
      let id = uuid.v4();
      let now = new Date();
      let fileName = `${id}${now.getSeconds()}${file.originalname}`
      cb(null, fileName);
    }
  }),
  limit: { fileSize: 5 * 1024 * 1024 } //5MB (파일용량)
});

app.post('/api/activities', upload.array('images'), async (req, res) => {
  // console.log(req.body);
  // console.log(req.files);
  // console.log(req.headers.authorization)
  //이미지 업로드 완료, 그뒤에 
  //mysql 에 게시글 제목, 내용, 작성자, 작성일자, insert into
  const token = req.headers.authorization.replace('Bearer ', '');
  const user = jwt.verify(token, process.env.JWT_SECRET);
  const { title, content } = req.body; //req.body에 들어있는 title, content
  //req.files[0].filename -->  이미지 파일 이름(우리컴퓨터에 저장된 파일 이름)

  try {
    let sql = `insert into tbl_activities
        (title, content, writer_email, activity_view)
        values
        (?, ?, ?, 0) 
        `; //조회수는 초기값은 0이니까 
    let [result] = await pool.query(sql, [
      title,
      content,
      user.email
    ]);
    //🌟result.insertId --> 새로 추가된 게시물의 id 값
    // console.log(result);

    //이미지 경로도 mysql, tbl_activity_img 테이블에 추가
    sql = `
        insert into tbl_activity_img
        (activity_id, img_url)
        values
        (?, ?)
        `;

    for (let i = 0; i < req.files.length; i++) {
      await pool.query(sql, [result.insertId, '/images/' + req.files[i].filename]);
    } //🌟files안에있는것들 업로드한 이미지들. result.insertId(방금 새로 추가된 게시물 id
    //'/images/' 폴더로 추가된 이미지가 들어간다. 

    //react 에게 응답
    res.json({ id: result.insertId }); //게시글인데 방금 추가된 id 
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
})

const fs = require('fs')

app.put('/api/activities', upload.array('images'), async (req, res) => {
  // console.log(req.files)
  // console.log(req.body);
  // console.log(req.headers.authorization);

  // 기존 이미지를 삭제하기 위한 쿼리
  let sql = `
    delete from tbl_activity_img
    where img_url = ?;
  `
  console.log(req.body.deleteImg);
  console.log(req.body);
  //문자열을 json파일(배열)로 변경
  const deleteImg = JSON.parse(req.body.deleteImg);
  try {
    for (let i = 0; i < deleteImg.length; i++) {
      console.log(deleteImg[i]);
      await pool.query(sql, [deleteImg[i]]); // 테이블에서 이미지 삭제
      fs.unlinkSync(`../public${deleteImg[i]}`);// 폴더에서 이미지 삭제
    }

    //title, content, updated_date를 변경
    sql = `
      update tbl_activities
      set title=?, content=?, updated_date=now()
      where id = ?
    `;
    await pool.query(sql, [req.body.title, req.body.content, req.body.id]);

    //새로 추가할 이미지
    sql = `
      insert into tbl_activity_img
      values(?, ?)
    `;
    for (let i = 0; i < req.files.length; i++) {
      //req.body.id --> 수정할 게시물의 id 
      //req.files --> 수정할 이미지 파일들
      //반복문을 써서 req.files에 있는 이미지들을 mysql에 추가
      await pool.query(sql, [Number(req.body.id), `/images/${req.files[i].filename}`]);
    }
    //수정되면 수정된 게시글의 id를 리액트로 보내줌
    res.json({ id: Number(req.body.id) });

  } catch (err) {
    console.log(err);
    res.status(500).json('실패');
  }
})

app.delete('/api/activities/:id', async (req, res) => {
  try {
    // 1. 로그인 한 사람의 email 
    let token = req.headers.authorization.replace('Bearer ', '');
    let user = jwt.verify(token, process.env.JWT_SECRET);
    // user.email --> 로그인 한 사람의 이메일
    let id = Number(req.params.id) // 삭제하려는 게시글 아이디 (문자열이니까 숫자로 바꿔줌)
    let [rows] = await pool.query(
      'select * from tbl_activities where id = ?', [id]
    ); //rows는 배열

    if (rows[0].writer_email !== user.email) { //로그인한 사람의 이메일과 게시글 작성자의 이메일이 다르면
      res.status(403).json('접근 권한 없음');
      return;
    }
    // 1.해당 게시글에 달린 댓글 삭제
    await pool.query('delete from tbl_comments where activity_id = ?', [id]);

    //2.해당 게시글에 달린 좋아요 삭제
    await pool.query('delete from tbl_activity_like where activity_id = ?', [id]);

    //3-1.해당 게시글에 달린 이미지 삭제 (sql만 삭제)
    let [imgs] = await pool.query('select * from tbl_activity_img where activity_id = ?', [id]); 
    
    //3-2.실제 이미지 파일 삭제
    for (let i = 0; i < imgs.length; i++) { //이미지가 여러개일 수 있으니까 반복문 사용.
        fs.unlinkSync(`../public${imgs[i].img_url}`); 
    }

    //4.해당 게시글 삭제
    await pool.query('delete from tbl_activity_img where activity_id = ?', [id]);

    await pool.query('delete from tbl_activities where id = ?', [id]);
    res.json('삭제 성공');
    
  } catch (err) {
    res.status(500).json('오류 발생');
  }
}); //불가능하다 게시글을 삭제하려면, 문제가생긴다 


//🌟좋아요 테이블에 추가 - 필요한 정보 ( 리액트가 줘야하는건 게시물 id, 로그인한사람의 email)
app.post('/api/like', async (req, res) => {
  const id = req.body.id //body 안에 id가 들어있음/ 게시물 id
  const token = req.headers.authorization.replace('Bearer ', '');
  const user = jwt.verify(token, process.env.JWT_SECRET);
  //user.email --> 로그인한 사람의 email

  let sql = `
    insert into tbl_activity_like
    values (?, ?);
  `;

  try {
    await pool.query(sql, [id, user.email]);
    res.json('추가 성공!');
  } catch (err) {
    console.log(err);
    res.status(500).json('오류발생했음');
  }
})

//🌟좋아요 테이블에서 삭제 ( 리액트가 줘야하는건 게시물 id, 로그인한사람의 email)
app.delete('/api/like', async (req, res) => {
  const id = req.body.id //body 안에 id가 들어있음/ 게시물 id
  const token = req.headers.authorization.replace('Bearer ', '');
  const user = jwt.verify(token, process.env.JWT_SECRET);
  //user.email --> 로그인한 사람의 email

  let sql = `
   delete from tbl_activity_like
    where activity_id = ? and email = ?;
  `;
  try {
    await pool.query(sql, [id, user.email]);
    res.json('삭제 성공!');
  } catch (err) {
    console.log(err);
    res.status(500).json('오류발생했음');
  }
})

app.get('/api/comments', async (req, res) => {
  const activityId = Number(req.query.activityId);
  const limit = Number(req.query.limit); //한페이지에 보여줄 댓글 갯수
  const page = Number(req.query.page); //보여줄 페이지
  const offset = (page - 1) * limit; //건너뛸 댓글 갯수
  console.log(activityId)
  let sql = `
        select * from tbl_comments
        where activity_id = ?
        order by created_date asc
        limit ? offset ?;
   `;

  try {
    const token = req.headers.authorization.replace('Bearer ', '');
    let user = jwt.verify(token, process.env.JWT_SECRET);
    let [results] = await pool.query(sql, [activityId, limit, offset])

    results = results.map((el) => ({ ...el, owner: el.writer_email === user.email }));
    //console.log(results);
    res.json(results);

  } catch (err) {
    res.status(500).json('오류발생');
  }
})

app.post('/api/comments', async (req, res) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  let user = jwt.verify(token, process.env.JWT_SECRET);

  const content = req.body.content;
  const activityId = req.body.activityId;

  let sql = `
      INSERT INTO tbl_comments
      (content, activity_id, writer_email)
      VALUES (?, ?, ?);
  `;
  try {
    let [result] = await pool.query(sql, [content, activityId, user.email]);
    let [rows] = await pool.query('select * from tbl_comments where id = ?', [result.insertId]);
    // console.log(rows);
    res.json({ ...rows[0], owner: rows[0].writer_email === user.email }); //리액트한테 응답 
  } catch (err) {
    console.error(err);
    res.status(500).json('오류발생');
  }
});

app.delete('/api/comments', async (req, res) => {
  const id = req.body.commentId; //리액트가 준 삭제할 댓글 id
  //console.log(id)
  try {
    await pool.query('DELETE FROM tbl_comments WHERE id = ?', [id]);
    res.json('삭제완료');
  } catch (err) {
    console.error(err);
    res.status(500).json('오류발생');
  }
});

app.put('/api/comments', async (req, res) => {
  const id = req.body.commentId; //리액트가 준 수정할 댓글 id
  const content = req.body.content; //리액트가 준 수정할 댓글 내용
  const token = req.headers.authorization.replace('Bearer ', '');
  const user = jwt.verify(token, process.env.JWT_SECRET);

  let sql = `
      UPDATE tbl_comments
      SET content = ?,
      updated_date = now()
      WHERE id = ?;
  `;
  try {
    let [result] = await pool.query(sql, [content, id]); //수정된 댓글의 id를 result에 담아준다.
    //console.log(result);
    let [rows] = await pool.query('select * from tbl_comments where id = ?', [id]);

    console.log(rows)
    res.json({
      ...rows[0], //0번째방을 리액트한테 응답
      owner: rows[0].writer_email === user.email
    }); //리액트한테 응답
  } catch (err) {
    res.status(500).json('mysql 오류발생');
  }
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});