'use strict';
import $ from 'jquery';
const global = Function('return this;')();
global.jQuery = $;
import bootstrap from 'bootstrap';

// 各繰り返し処理で実行したい関数を指定 each (index, Element)
$('.availability-toggle-button').each((i, e) => {
  const button = $(e);
  button.click(() => {
    const scheduleId = button.data('schedule-id');
    const userId = button.data('user-id');
    const candidateId = button.data('candidate-id');
    const availability = parseInt(button.data('availability'));
    const nextAvailability = (availability + 1) % 3;
    // Ajax通信によって送られるオプションを送信前に独自に制御したい場合に使用
    $.post(`/schedules/${scheduleId}/users/${userId}/candidates/${candidateId}`, {
      // 送るデータ
      availability: nextAvailability,
    },
    (data) => {
      // リクエストが成功した際に実行する
      button.data('availability', data.availability);
      const availabilityLabels = ['欠', '？', '出'];
      button.text(availabilityLabels[data.availability]);

      const buttonStyles = ['btn-danger', 'btn-default', 'btn-success'];
      button.removeClass('btn-danger btn-default btn-success');
      button.addClass(buttonStyles[data.availability]);
    });
  });
});

const buttonSelfComment = $('#self-comment-button');
buttonSelfComment.click(() => {
  const scheduleId = buttonSelfComment.data('schedule-id');
  const userId = buttonSelfComment.data('user-id');
  const comment = prompt('コメントを255文字以内で入力してください。');
  if (comment) {
    $.post(`/schedules/${scheduleId}/users/${userId}/comments`, {
      comment: comment,
    },
    (data) => {
      $('#self-comment').text(data.comment);
    });
  }
});
