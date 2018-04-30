'use strict';
// Express の Router オブジェクトをテストするモジュール
const request = require('supertest');
// テストの対象となる、 app.js の読み込み
const app = require('../app');
const passportStub = require('passport-stub');
let User = require('../models/user');
let Schedule = require('../models/schedule');
let Candidate = require('../models/candidate');

describe('/login', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({
      username: 'testuser',
    });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall();
  });


  it('ログインのためのリンクが含まれる', (done) => {
    request(app)
      .get('/login')
      // expect 関数に、文字列を 2 つ引数として渡し、ヘッダにその値が存在するかをテスト
      .expect('Content-Type', 'text/html; charset=utf-8')
      // expect 関数に、正規表現を一つ渡すと、 HTML の body 内にその正規表現が含まれるかをテスト
      .expect(/<a href="\/auth\/github"/)
      // テストを終了する際には、 expect 関数に、期待されるステータスコードの整数と、テスト自体の引数に渡される done 関数を渡す
      .expect(200, done);
  });

  it('ログイン時はユーザー名が表示される', (done) => {
    request(app)
      .get('/login')
      .expect(/testuser/)
      .expect(200, done);
  });
});

describe('/logout', () => {
  it('/ にリダイレクトされる', (done) => {
    request(app)
      .get('/logout')
      .expect('Location', '/')
      .expect(302, done);
  });
});

describe('/schedules', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({
      id: 0,
      username: 'testuser',
    });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('予定が作成でき、表示される', (done) => {
    User.upsert({
      userId: 0,
      username: 'testuser',
    }).then(() => {
      request(app)
        .post('/schedules')
        .send({
          scheduleName: 'テスト予定1',
          memo: 'テストメモ1\r\nテストメモ2',
          candidates: 'テスト候補1\r\nテスト候補2\r\nテスト候補3',
        })
        .expect('Location', /schedules/)
        .expect(302)
        .end((err, res) => {
          const createdSchedulePath = res.headers.location;
          request(app)
            .get(createdSchedulePath)
            .expect(/テスト予定1/)
            .expect(/テストメモ1/)
            .expect(/テストメモ2/)
            .expect(/テスト候補1/)
            .expect(/テスト候補2/)
            .expect(/テスト候補3/)
            .expect(200)
            .end((err, res) => {
              // テストで作成したデータを削除
              const scheduleId = createdSchedulePath.split('/schedules/')[1];
              Candidate.findAll({
                where: {
                  scheduleId: scheduleId,
                },
              }).then((candidates) => {
                candidates.forEach((c) => {
                  c.destroy();
                });
                Schedule.findById(scheduleId).then((s) => {
                  s.destroy();
                });
              });
              if (err) return done(err);
              done();
            });
        });
    });
  });
});
