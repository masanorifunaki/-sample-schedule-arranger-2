'use strict';
// Express の Router オブジェクトをテストするモジュール
const request = require('supertest');
// テストの対象となる、 app.js の読み込み
const app = require('../app');

describe('/login', () => {
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
});
