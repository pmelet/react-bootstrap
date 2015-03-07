import React from 'react';
import ReactTestUtils from 'react/lib/ReactTestUtils';
import ButtonToolbar from '../lib/ButtonToolbar';
import ButtonGroup from '../lib/ButtonGroup';
import Button from '../lib/Button';

describe('ButtonToolbar', function () {
  it('Should output a button toolbar', function () {
    let instance = ReactTestUtils.renderIntoDocument(
      <ButtonToolbar>
        <ButtonGroup>
          <Button>
            Title
          </Button>
        </ButtonGroup>
      </ButtonToolbar>
    );
    assert.equal(instance.getDOMNode().nodeName, 'DIV');
    assert.ok(instance.getDOMNode().className.match(/\bbtn-toolbar\b/));
    assert.equal(instance.getDOMNode().getAttribute('role'), 'toolbar');
  });
});
