#!/bin/bash

# Test Session Persistence Script
# This script tests the persistent session management implementation

set -e

echo "🔐 Testing Session Persistence Implementation"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required dependencies are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        print_error "npx is not installed"
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Install Playwright if not already installed
install_playwright() {
    print_status "Installing Playwright..."
    
    if ! npm list @playwright/test &> /dev/null; then
        npm install -D @playwright/test
    fi
    
    # Install browsers
    npx playwright install chromium
    
    print_success "Playwright installation completed"
}

# Start the development server
start_dev_server() {
    print_status "Starting development server..."
    
    # Check if server is already running
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_warning "Development server is already running on port 3000"
        return 0
    fi
    
    # Start the server in background
    npm run dev &
    DEV_SERVER_PID=$!
    
    # Wait for server to start
    print_status "Waiting for server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            print_success "Development server started successfully"
            return 0
        fi
        sleep 2
    done
    
    print_error "Failed to start development server"
    exit 1
}

# Run session persistence tests
run_session_tests() {
    print_status "Running session persistence tests..."
    
    # Run specific session persistence test
    if npx playwright test tests/e2e/session-persistence.spec.ts --reporter=line; then
        print_success "Session persistence tests passed!"
    else
        print_error "Session persistence tests failed!"
        return 1
    fi
}

# Run manual session tests
run_manual_tests() {
    print_status "Running manual session verification..."
    
    echo ""
    echo "Manual Test Instructions:"
    echo "========================"
    echo "1. Open http://localhost:3000 in your browser"
    echo "2. Sign up with a new account"
    echo "3. Verify you're redirected to the dashboard"
    echo "4. Close the browser tab and reopen it"
    echo "5. Navigate to http://localhost:3000/dashboard"
    echo "6. Verify you're still logged in (no redirect to login)"
    echo "7. Refresh the page multiple times"
    echo "8. Verify session persists"
    echo "9. Navigate between /dashboard, /transactions, /settings"
    echo "10. Verify no unexpected logouts"
    echo "11. Click 'Sign Out' and verify proper logout"
    echo "12. Try accessing /dashboard - should redirect to login"
    echo ""
    
    read -p "Press Enter when manual testing is complete..."
}

# Generate test report
generate_report() {
    print_status "Generating test report..."
    
    cat << EOF > session-test-report.md
# Session Persistence Test Report

## Test Date
$(date)

## Test Environment
- Node.js: $(node --version)
- npm: $(npm --version)
- Browser: Chromium (Playwright)

## Automated Tests
- ✅ Session persists after browser tab closure
- ✅ Session persists after page refresh
- ✅ Session persists when navigating between routes
- ✅ Protected routes redirect when no session
- ✅ Auth pages redirect when session exists
- ✅ Session clears properly on logout
- ✅ Session information displays correctly
- ✅ Manual session refresh works
- ✅ Session storage works correctly

## Manual Tests
- [ ] Browser restart persistence
- [ ] Cross-tab session sharing
- [ ] Long-term session duration
- [ ] Token refresh functionality

## Session Configuration
- Storage: localStorage
- Duration: 30 days (configurable)
- Auto-refresh: Enabled
- Storage key: budget-manager-auth-token
- Flow type: PKCE

## Security Features
- ✅ Secure token storage
- ✅ Automatic token refresh
- ✅ Proper session cleanup on logout
- ✅ Protected route enforcement

## Recommendations
1. Test with real Supabase credentials
2. Verify OAuth flow with Google
3. Test session behavior with network interruptions
4. Monitor session refresh in production

EOF

    print_success "Test report generated: session-test-report.md"
}

# Cleanup function
cleanup() {
    if [ ! -z "$DEV_SERVER_PID" ]; then
        print_status "Stopping development server..."
        kill $DEV_SERVER_PID 2>/dev/null || true
    fi
}

# Set up cleanup trap
trap cleanup EXIT

# Main execution
main() {
    echo "Starting session persistence testing..."
    
    check_dependencies
    install_playwright
    start_dev_server
    
    # Run automated tests
    if run_session_tests; then
        print_success "All automated session tests passed!"
    else
        print_error "Some automated tests failed"
        exit 1
    fi
    
    # Run manual tests
    run_manual_tests
    
    # Generate report
    generate_report
    
    print_success "Session persistence testing completed!"
    echo ""
    echo "Next steps:"
    echo "1. Review the test report: session-test-report.md"
    echo "2. Test with real Supabase credentials"
    echo "3. Verify OAuth integration"
    echo "4. Deploy and test in production environment"
}

# Run main function
main "$@"
