import pluralize from 'pluralize';

import testData from '../../data';
import { formatDate } from '../../../lib/util';
import { mockLogin, mockRouteThroughLogin } from '../../session';
import { mockRoute } from '../../http';
import { trigger } from '../../event';

describe('ProjectList', () => {
  describe('routing', () => {
    it('redirects an anonymous user to login', () =>
      mockRoute('/')
        .restoreSession(false)
        .afterResponse(app => {
          app.vm.$route.path.should.equal('/login');
        }));

    it('redirects the user back after login', () =>
      mockRouteThroughLogin('/')
        .respondWithData(() => testData.extendedProjects.createPast(1).sorted())
        .respondWithData(() => testData.administrators.sorted())
        .afterResponses(app => {
          app.vm.$route.path.should.equal('/');
        }));

    for (const selector of ['.navbar-brand', '#navbar-projects-link']) {
      it(`redirects user to project list upon a click on ${selector}`, () => {
        mockLogin();
        return mockRoute('/users')
          .respondWithData(() => testData.administrators.sorted())
          .complete()
          .request(app => trigger.click(app, selector))
          .respondWithData(() => testData.extendedProjects.createPast(1).sorted())
          .respondWithData(() => testData.administrators.sorted())
          .afterResponses(app => {
            app.vm.$route.path.should.equal('/');
          });
      });
    }
  });

  describe('after login', () => {
    beforeEach(mockLogin);

    describe('Right Now', () => {
      it('shows counts', () =>
        mockRoute('/')
          .respondWithData(() => testData.extendedProjects.createPast(2).sorted())
          .respondWithData(() => testData.administrators.sorted())
          .afterResponses(app => {
            const counts = app.find('.project-list-right-now-count');
            counts.map(count => count.text().trim()).should.eql(['1', '2']);
          }));

      const targets = [
        ['icon', '.project-list-right-now-icon-container'],
        ['count', '.project-list-right-now-count a'],
        ['description', '.project-list-right-now-description a']
      ];
      for (const [description, selector] of targets) {
        it(`renders a link to /users for the users ${description}`, () =>
          mockRoute('/')
            .respondWithData(() => testData.extendedProjects.createPast(1).sorted())
            .respondWithData(() => testData.administrators.sorted())
            .afterResponses(app => {
              app.first(selector).getAttribute('href').should.equal('#/users');
            }));

        it(`scrolls down the page upon a click on the projects ${description}`, () =>
          mockRoute('/', { attachToDocument: true })
            .respondWithData(() => testData.extendedProjects.createPast(1).sorted())
            .respondWithData(() => testData.administrators.sorted())
            .afterResponses(app => {
              window.pageYOffset.should.equal(0);
              return trigger.click(app.find(selector)[1]);
            })
            // Wait for the animation to complete.
            .then(() => new Promise(resolve => {
              setTimeout(resolve, 400);
            }))
            .then(() => {
              window.pageYOffset.should.not.equal(0);
            }));
      }
    });

    it('lists the projects in the correct order', () =>
      mockRoute('/')
        .respondWithData(() => testData.extendedProjects
          .createPast(1, { name: 'a' })
          .createPast(1, { name: 'b' })
          .sorted())
        .respondWithData(() => testData.administrators.sorted())
        .afterResponses(app => {
          const a = app.find('.project-list-project-name a');
          a.length.should.equal(2);
          const names = a.map(wrapper => wrapper.text().trim());
          names.should.eql(['a', 'b']);
        }));

    it('displays a row of the table correctly', () =>
      mockRoute('/')
        .respondWithData(() => testData.extendedProjects.createPast(1).sorted())
        .respondWithData(() => testData.administrators.sorted())
        .afterResponses(app => {
          const td = app.find('#project-list-table td');
          const project = testData.extendedProjects.last();
          td.length.should.equal(3);
          const a = td[0].first('a');
          a.text().trim().should.equal(project.name);
          a.getAttribute('href').should.equal('#/projects/1');
          td[1].text().trim().should.equal(pluralize('form', project.forms, true));
          td[2].text().trim().should.equal(formatDate(project.lastSubmission, '(none)'));
        }));

    it('shows a message if there are no projects', () =>
      mockRoute('/')
        .respondWithData(() => testData.extendedProjects.sorted())
        .respondWithData(() => testData.administrators.sorted())
        .afterResponses(app => {
          app.find('#project-list-empty-message').length.should.equal(1);
        }));
  });
});
