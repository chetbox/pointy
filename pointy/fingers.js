var HAND_COLOURS = ['#0000ff', '#ff00ff'];

function ratio(n) {
  return Math.min(1.0, Math.max(0.0, n));
}

function normalise_to_screen(pos) {
  return [ratio((pos[0]+125)/250),ratio((pos[1]-50)/160),ratio((pos[2]+250)/500)];
}

function to_screen_coords(normalised_pos, radius) {
  return {
    x: Math.round(normalised_pos[0]*screen.width-radius),
    y: Math.round((1-normalised_pos[1])*screen.height-radius)
  };
}

$(function(){

  var body = $('body');

  var pointers = {};

  // render each frame
  function draw(obj) {

    var pointers_to_remove = $.extend({}, pointers);

    // render circles based on pointable positions
    var pointablesMap = obj.pointablesMap;

    var allowGesture = true;

    for (var i in obj.gestures) {
      var gesture = obj.gestures[i];
      if (allowGesture && gesture.state === 'stop') {

        allowGesture = false;
        setTimeout(1000, function() { allowGesture = true; });

        console.log(gesture);

        if (gesture.type === 'circle') {
          var normalised_pos = normalise_to_screen(gesture.center);
          var radius = gesture.radius * 12 * normalised_pos[2];
          var pos = to_screen_coords(normalised_pos, radius);
          body.append(
            $('<div>')
              .addClass('chet-splodge')
              .css({
                width: (radius * 2) + 'px',
                height: (radius * 2) + 'px',
                left: pos.x + 'px',
                top: pos.y + 'px',
                'border-radius': radius
              })
          );
        } else if (gesture.type === 'swipe') {
          console.log(gesture.duration)
          body.find('.chet-splodge').remove();
        }
      }
    }

    for (var i in pointablesMap) {
      // get the pointable's position
      var pointable = pointablesMap[i];
      //var pos = pointable.stabilizedTipPosition;
      var pos = pointable.tipPosition;

      // console.log(pointable)

      // create a circle for each pointable
      var normalised_pos = normalise_to_screen(pos);
      var radius = Math.min((250+pos[2])/1.5,Math.max(screen.width,screen.height)/2);
      var screen_pos = to_screen_coords(normalised_pos, radius);
      var alpha = 1.0-normalised_pos[2];
      var colour = HAND_COLOURS[pointable.handId % 2];

      if (pointers_to_remove[pointable.id]) {
        delete pointers_to_remove[pointable.id];
      }

      var el = pointers[pointable.id]
        ? pointers[pointable.id]
        : $('<div>').attr('id', 'chet-point-' + pointable.id).addClass('chet-point').appendTo(body);
      pointers[pointable.id] = el;

      el.css({
          left: screen_pos.x + 'px',
          top: screen_pos.y + 'px',
          width: (radius * 2) + 'px',
          height: (radius * 2) + 'px',
          opacity: alpha,
          'border-radius': radius + 'px',
          'background-color': colour
        });
    }

    $.each(pointers_to_remove, function(id,el) { el.remove(); });
  };

  // listen to Leap Motion
  Leap.loop({
    frameEventName: 'deviceFrame',
    enableGestures: true,
  }, draw);

});
