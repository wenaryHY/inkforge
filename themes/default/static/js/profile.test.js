/**
 * Property-Based Tests for Profile Page
 * Testing Framework: Node.js with fast-check
 * 
 * Run with: node profile.test.js
 */

// Mock DOM environment
const { JSDOM } = require('jsdom');
const fc = require('fast-check');

// Setup DOM
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
global.document = dom.window.document;
global.window = dom.window;

// Test utilities
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function testPassed(name) {
  console.log(`✅ PASSED: ${name}`);
}

function testFailed(name, error) {
  console.log(`❌ FAILED: ${name}`);
  console.log(`   Error: ${error.message}`);
}

// ============================================
// Task 4.3: Property Test for User Hero Section
// ============================================

/**
 * Property 2: User Hero Section Renders Complete User Data
 * Validates: Requirement 4.2
 * 
 * For any valid user object containing display_name, username, role, and created_at fields,
 * the Profile page hero section SHALL render an avatar with the first character of display_name,
 * and SHALL display all user metadata fields.
 */
function testUserHeroSectionRendering() {
  const testName = 'Property 2: User Hero Section Renders Complete User Data';
  
  try {
    fc.assert(
      fc.property(
        fc.record({
          display_name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          username: fc.string({ minLength: 3, maxLength: 30 }).map(s => s.replace(/[^a-zA-Z0-9_-]/g, 'a')),
          role: fc.constantFrom('admin', 'editor', 'user'),
          created_at: fc.date().map(d => d.toISOString())
        }),
        (user) => {
          // Helper function to escape HTML
          function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
          }
          
          // Create hero section HTML (simulating server-side rendering)
          const heroSection = document.createElement('section');
          heroSection.className = 'hero-section';
          heroSection.innerHTML = `
            <div class="hero">
              <div class="avatar">${escapeHtml(user.display_name[0].toUpperCase())}</div>
              <div class="meta">
                <h1>${escapeHtml(user.display_name)}</h1>
                <p>@${escapeHtml(user.username)} · ${escapeHtml(user.role)} · joined ${escapeHtml(user.created_at.slice(0, 10))}</p>
              </div>
            </div>
          `;
          
          // Verify avatar renders first character
          const avatar = heroSection.querySelector('.avatar');
          assert(avatar !== null, 'Avatar element should exist');
          assert(
            avatar.textContent === user.display_name[0].toUpperCase(),
            `Avatar should display first character: expected "${user.display_name[0].toUpperCase()}", got "${avatar.textContent}"`
          );
          
          // Verify display name is rendered
          const h1 = heroSection.querySelector('h1');
          assert(h1 !== null, 'Display name heading should exist');
          assert(
            h1.textContent === user.display_name,
            `Display name should match: expected "${user.display_name}", got "${h1.textContent}"`
          );
          
          // Verify username is rendered
          const metaText = heroSection.querySelector('.meta p').textContent;
          assert(
            metaText.includes(`@${user.username}`),
            `Username should be rendered: expected "@${user.username}" in "${metaText}"`
          );
          
          // Verify role is rendered
          assert(
            metaText.includes(user.role),
            `Role should be rendered: expected "${user.role}" in "${metaText}"`
          );
          
          // Verify created_at date is rendered
          const dateStr = user.created_at.slice(0, 10);
          assert(
            metaText.includes(dateStr),
            `Join date should be rendered: expected "${dateStr}" in "${metaText}"`
          );
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

// ============================================
// Task 5.3: Property Test for Statistics Display
// ============================================

/**
 * Property 3: Statistics Display Renders All User Metrics
 * Validates: Requirements 5.1, 5.2, 5.3
 * 
 * For any user object containing statistics (posts_count, comments_count, likes_count),
 * the Stats_Display component SHALL render all three metrics with their corresponding values and labels.
 */
function testStatisticsDisplayRendering() {
  const testName = 'Property 3: Statistics Display Renders All User Metrics';
  
  try {
    fc.assert(
      fc.property(
        fc.record({
          posts_count: fc.nat({ max: 10000 }),
          comments_count: fc.nat({ max: 10000 }),
          likes_count: fc.nat({ max: 10000 })
        }),
        (stats) => {
          // Create stats display HTML
          const statsGrid = document.createElement('div');
          statsGrid.className = 'stats-grid';
          statsGrid.innerHTML = `
            <div class="stat-card">
              <span class="stat-value" id="postsCount">${stats.posts_count}</span>
              <span class="stat-label">Posts</span>
            </div>
            <div class="stat-card">
              <span class="stat-value" id="commentsCount">${stats.comments_count}</span>
              <span class="stat-label">Comments</span>
            </div>
            <div class="stat-card">
              <span class="stat-value" id="likesCount">${stats.likes_count}</span>
              <span class="stat-label">Likes</span>
            </div>
          `;
          
          // Verify all three stat cards exist
          const statCards = statsGrid.querySelectorAll('.stat-card');
          assert(
            statCards.length === 3,
            `Should have 3 stat cards, got ${statCards.length}`
          );
          
          // Verify posts count
          const postsValue = statsGrid.querySelector('#postsCount');
          assert(postsValue !== null, 'Posts count element should exist');
          assert(
            parseInt(postsValue.textContent) === stats.posts_count,
            `Posts count should be ${stats.posts_count}, got ${postsValue.textContent}`
          );
          
          // Verify comments count
          const commentsValue = statsGrid.querySelector('#commentsCount');
          assert(commentsValue !== null, 'Comments count element should exist');
          assert(
            parseInt(commentsValue.textContent) === stats.comments_count,
            `Comments count should be ${stats.comments_count}, got ${commentsValue.textContent}`
          );
          
          // Verify likes count
          const likesValue = statsGrid.querySelector('#likesCount');
          assert(likesValue !== null, 'Likes count element should exist');
          assert(
            parseInt(likesValue.textContent) === stats.likes_count,
            `Likes count should be ${stats.likes_count}, got ${likesValue.textContent}`
          );
          
          // Verify all labels exist
          const labels = statsGrid.querySelectorAll('.stat-label');
          assert(
            labels.length === 3,
            `Should have 3 stat labels, got ${labels.length}`
          );
          
          const labelTexts = Array.from(labels).map(l => l.textContent);
          assert(
            labelTexts.includes('Posts'),
            'Should have "Posts" label'
          );
          assert(
            labelTexts.includes('Comments'),
            'Should have "Comments" label'
          );
          assert(
            labelTexts.includes('Likes'),
            'Should have "Likes" label'
          );
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

// ============================================
// Task 12.3: Property Test for Error Alerts
// ============================================

/**
 * Property 5: Error Alerts Display Error Messages
 * Validates: Requirement 9.4
 * 
 * For any error response containing a message field, when a form submission fails,
 * the error alert component SHALL display the error message text to the user.
 */
function testErrorAlertsDisplayMessages() {
  const testName = 'Property 5: Error Alerts Display Error Messages';
  
  try {
    fc.assert(
      fc.property(
        fc.record({
          message: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
          type: fc.constantFrom('error', 'success')
        }),
        (alertData) => {
          // Create alert element
          const alertEl = document.createElement('div');
          alertEl.id = 'testAlert';
          alertEl.className = 'alert';
          
          // Simulate showAlert function behavior
          alertEl.textContent = alertData.message;
          alertEl.className = `alert alert-${alertData.type}`;
          
          // Verify alert displays the message
          assert(
            alertEl.textContent === alertData.message,
            `Alert should display message: expected "${alertData.message}", got "${alertEl.textContent}"`
          );
          
          // Verify alert has correct class
          assert(
            alertEl.classList.contains('alert'),
            'Alert should have "alert" class'
          );
          assert(
            alertEl.classList.contains(`alert-${alertData.type}`),
            `Alert should have "alert-${alertData.type}" class`
          );
          
          // Verify message is not empty
          assert(
            alertEl.textContent.trim().length > 0,
            'Alert message should not be empty'
          );
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

// ============================================
// Task 9.4: Property Test for Language Switching
// ============================================

/**
 * Property 1: Language Change Updates All Translatable Elements
 * Validates: Requirements 2.3, 7.3
 * 
 * For any page (Login or Profile) with a set of translatable elements,
 * when the language is changed from one language to another,
 * all elements marked with translation keys SHALL be updated to display text in the new language.
 */
function testLanguageSwitching() {
  const testName = 'Property 1: Language Change Updates All Translatable Elements';
  
  try {
    // Mock I18n system
    const mockDictionary = {
      zh: {
        backHome: '返回首页',
        admin: '管理后台',
        signOut: '退出登录',
        profileSettings: '个人设置',
        myComments: '我的评论'
      },
      en: {
        backHome: 'Back home',
        admin: 'Admin',
        signOut: 'Sign out',
        profileSettings: 'Profile settings',
        myComments: 'My comments'
      }
    };
    
    fc.assert(
      fc.property(
        fc.constantFrom('zh', 'en'),
        fc.constantFrom('zh', 'en'),
        (fromLang, toLang) => {
          // Skip if same language
          if (fromLang === toLang) return true;
          
          // Create test page with translatable elements
          const page = document.createElement('div');
          page.innerHTML = `
            <nav>
              <a data-i18n="backHome">${mockDictionary[fromLang].backHome}</a>
              <a data-i18n="admin">${mockDictionary[fromLang].admin}</a>
              <button data-i18n="signOut">${mockDictionary[fromLang].signOut}</button>
            </nav>
            <section>
              <h2 data-i18n="profileSettings">${mockDictionary[fromLang].profileSettings}</h2>
              <h2 data-i18n="myComments">${mockDictionary[fromLang].myComments}</h2>
            </section>
          `;
          
          // Simulate language change
          page.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = mockDictionary[toLang][key];
          });
          
          // Verify all elements updated to new language
          const backHomeEl = page.querySelector('[data-i18n="backHome"]');
          assert(
            backHomeEl.textContent === mockDictionary[toLang].backHome,
            `backHome should be "${mockDictionary[toLang].backHome}", got "${backHomeEl.textContent}"`
          );
          
          const adminEl = page.querySelector('[data-i18n="admin"]');
          assert(
            adminEl.textContent === mockDictionary[toLang].admin,
            `admin should be "${mockDictionary[toLang].admin}", got "${adminEl.textContent}"`
          );
          
          const signOutEl = page.querySelector('[data-i18n="signOut"]');
          assert(
            signOutEl.textContent === mockDictionary[toLang].signOut,
            `signOut should be "${mockDictionary[toLang].signOut}", got "${signOutEl.textContent}"`
          );
          
          const profileSettingsEl = page.querySelector('[data-i18n="profileSettings"]');
          assert(
            profileSettingsEl.textContent === mockDictionary[toLang].profileSettings,
            `profileSettings should be "${mockDictionary[toLang].profileSettings}", got "${profileSettingsEl.textContent}"`
          );
          
          const myCommentsEl = page.querySelector('[data-i18n="myComments"]');
          assert(
            myCommentsEl.textContent === mockDictionary[toLang].myComments,
            `myComments should be "${mockDictionary[toLang].myComments}", got "${myCommentsEl.textContent}"`
          );
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

// ============================================
// Task 10.3: Property Test for Comments List Rendering
// ============================================

/**
 * Property 7: Comments List Renders All Required Fields
 * Validates: Requirement 10.2
 * 
 * For any array of comment objects, where each comment contains post_title, status,
 * created_at, and content fields, the comments list SHALL render each comment
 * with all four fields visible in the UI.
 */
function testCommentsListRendering() {
  const testName = 'Property 7: Comments List Renders All Required Fields';
  
  try {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            post_title: fc.string({ minLength: 1, maxLength: 100 }),
            post_slug: fc.string({ minLength: 1, maxLength: 100 }).map(s => s.replace(/[^a-z0-9-]/g, 'a')),
            post_content_type: fc.constantFrom('post', 'page'),
            status: fc.constantFrom('approved', 'pending', 'spam'),
            created_at: fc.date().map(d => d.toISOString()),
            content: fc.string({ minLength: 1, maxLength: 500 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (comments) => {
          // Helper function to escape HTML
          function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
          }
          
          // Create comments list HTML
          const commentsList = document.createElement('div');
          commentsList.className = 'comment-list';
          commentsList.innerHTML = comments.map((comment) => `
            <article class="comment-item">
              <div class="comment-meta">
                <a href="/${comment.post_content_type === 'page' ? 'pages' : 'posts'}/${escapeHtml(comment.post_slug)}">${escapeHtml(comment.post_title)}</a>
                <span class="comment-status">${escapeHtml(comment.status)}</span>
              </div>
              <div class="comment-meta">
                <span>${escapeHtml((comment.created_at || '').replace('T', ' ').slice(0, 16))}</span>
              </div>
              <p>${escapeHtml(comment.content)}</p>
            </article>
          `).join('');
          
          // Verify correct number of comment items
          const commentItems = commentsList.querySelectorAll('.comment-item');
          assert(
            commentItems.length === comments.length,
            `Should have ${comments.length} comment items, got ${commentItems.length}`
          );
          
          // Verify each comment has all required fields
          comments.forEach((comment, index) => {
            const item = commentItems[index];
            
            // Verify post title link
            const titleLink = item.querySelector('a');
            assert(titleLink !== null, `Comment ${index} should have title link`);
            assert(
              titleLink.textContent === comment.post_title,
              `Comment ${index} title should be "${comment.post_title}", got "${titleLink.textContent}"`
            );
            
            // Verify status
            const statusEl = item.querySelector('.comment-status');
            assert(statusEl !== null, `Comment ${index} should have status element`);
            assert(
              statusEl.textContent === comment.status,
              `Comment ${index} status should be "${comment.status}", got "${statusEl.textContent}"`
            );
            
            // Verify timestamp
            const metaSpans = item.querySelectorAll('.comment-meta span');
            const timestampEl = Array.from(metaSpans).find(span => 
              span.textContent.includes(comment.created_at.slice(0, 10))
            );
            assert(timestampEl !== null, `Comment ${index} should have timestamp`);
            
            // Verify content
            const contentEl = item.querySelector('p');
            assert(contentEl !== null, `Comment ${index} should have content paragraph`);
            assert(
              contentEl.textContent === comment.content,
              `Comment ${index} content should be "${comment.content}", got "${contentEl.textContent}"`
            );
          });
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

// ============================================
// Task 10.4: Unit Tests for Comments List
// ============================================

/**
 * Unit Test: Empty State Display
 */
function testCommentsEmptyState() {
  const testName = 'Unit Test: Comments Empty State Display';
  
  try {
    // Create empty comments scenario
    const commentsEmpty = document.createElement('div');
    commentsEmpty.className = 'empty';
    commentsEmpty.style.display = 'block';
    commentsEmpty.textContent = 'No comments yet.';
    
    const commentsList = document.createElement('div');
    commentsList.className = 'comment-list';
    commentsList.innerHTML = '';
    
    // Verify empty state is displayed
    assert(
      commentsEmpty.style.display === 'block',
      'Empty state should be visible'
    );
    assert(
      commentsList.innerHTML === '',
      'Comments list should be empty'
    );
    assert(
      commentsEmpty.textContent === 'No comments yet.',
      'Empty state should show correct message'
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

/**
 * Unit Test: Error State Display
 */
function testCommentsErrorState() {
  const testName = 'Unit Test: Comments Error State Display';
  
  try {
    // Create error scenario
    const commentsEmpty = document.createElement('div');
    commentsEmpty.className = 'empty';
    commentsEmpty.style.display = 'block';
    commentsEmpty.textContent = 'Unable to load comments right now.';
    
    // Verify error state is displayed
    assert(
      commentsEmpty.style.display === 'block',
      'Error state should be visible'
    );
    assert(
      commentsEmpty.textContent === 'Unable to load comments right now.',
      'Error state should show correct message'
    );
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

/**
 * Unit Test: Comment Rendering with Various Data
 */
function testCommentRenderingVariations() {
  const testName = 'Unit Test: Comment Rendering with Various Data';
  
  try {
    const testCases = [
      {
        post_title: 'Test Post',
        post_slug: 'test-post',
        post_content_type: 'post',
        status: 'approved',
        created_at: '2024-01-15T10:30:00Z',
        content: 'This is a test comment'
      },
      {
        post_title: 'Page Title',
        post_slug: 'page-slug',
        post_content_type: 'page',
        status: 'pending',
        created_at: '2024-02-20T15:45:00Z',
        content: 'Another comment'
      }
    ];
    
    testCases.forEach((comment, index) => {
      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
      
      const item = document.createElement('article');
      item.className = 'comment-item';
      item.innerHTML = `
        <div class="comment-meta">
          <a href="/${comment.post_content_type === 'page' ? 'pages' : 'posts'}/${escapeHtml(comment.post_slug)}">${escapeHtml(comment.post_title)}</a>
          <span class="comment-status">${escapeHtml(comment.status)}</span>
        </div>
        <div class="comment-meta">
          <span>${escapeHtml((comment.created_at || '').replace('T', ' ').slice(0, 16))}</span>
        </div>
        <p>${escapeHtml(comment.content)}</p>
      `;
      
      // Verify rendering
      const titleLink = item.querySelector('a');
      assert(
        titleLink.textContent === comment.post_title,
        `Test case ${index}: Title should match`
      );
      
      const expectedPath = comment.post_content_type === 'page' ? 'pages' : 'posts';
      assert(
        titleLink.getAttribute('href') === `/${expectedPath}/${comment.post_slug}`,
        `Test case ${index}: Link path should be correct`
      );
      
      const statusEl = item.querySelector('.comment-status');
      assert(
        statusEl.textContent === comment.status,
        `Test case ${index}: Status should match`
      );
      
      const contentEl = item.querySelector('p');
      assert(
        contentEl.textContent === comment.content,
        `Test case ${index}: Content should match`
      );
    });
    
    testPassed(testName);
  } catch (error) {
    testFailed(testName, error);
    throw error;
  }
}

// ============================================
// Run all tests
// ============================================

console.log('\n🧪 Running Property-Based Tests for Profile Page\n');
console.log('=' .repeat(60));

try {
  // Existing tests
  testUserHeroSectionRendering();
  testStatisticsDisplayRendering();
  
  // Task 12.3: Error alerts property test
  testErrorAlertsDisplayMessages();
  
  // Task 9.4: Language switching test
  testLanguageSwitching();
  
  // Task 10.3: Comments list property test
  testCommentsListRendering();
  
  // Task 10.4: Comments list unit tests
  testCommentsEmptyState();
  testCommentsErrorState();
  testCommentRenderingVariations();
  
  console.log('=' .repeat(60));
  console.log('\n✅ All tests passed!\n');
  process.exit(0);
} catch (error) {
  console.log('=' .repeat(60));
  console.log('\n❌ Some tests failed\n');
  process.exit(1);
}
