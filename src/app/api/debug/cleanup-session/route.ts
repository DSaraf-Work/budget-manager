import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Session cleanup endpoint called')
    
    // This endpoint will return instructions for manual cleanup
    // since we can't directly manipulate client-side storage from server
    
    const cleanupInstructions = {
      success: true,
      message: 'Session cleanup instructions',
      steps: [
        {
          step: 1,
          action: 'Clear localStorage',
          code: 'localStorage.clear()',
          description: 'Removes all localStorage items including old auth tokens'
        },
        {
          step: 2,
          action: 'Clear sessionStorage',
          code: 'sessionStorage.clear()',
          description: 'Removes all sessionStorage items'
        },
        {
          step: 3,
          action: 'Clear cookies',
          code: `document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});`,
          description: 'Removes all cookies for the current domain'
        },
        {
          step: 4,
          action: 'Refresh page',
          code: 'window.location.reload()',
          description: 'Reloads the page to start with clean session'
        }
      ],
      automaticCleanup: {
        available: true,
        description: 'You can run all cleanup steps automatically',
        jsCode: `
// Run this in browser console for automatic cleanup
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('Session cleaned up successfully');
window.location.reload();
        `.trim()
      },
      nextSteps: [
        'After cleanup, sign in again with your preferred email',
        'Ensure database schema is applied',
        'Create user profile',
        'Test Gmail connection'
      ]
    }
    
    return NextResponse.json(cleanupInstructions)
  } catch (error) {
    console.error('Session cleanup error:', error)
    return NextResponse.json(
      { 
        error: 'Session cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
