import requests
import sys
from datetime import datetime
import json

class RealEstateAPITester:
    def __init__(self, base_url="https://inmobiliario-agentes.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.auth_token = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Add auth header if required and token available
        if auth_required and self.auth_token:
            headers['Authorization'] = f'Bearer {self.auth_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())}")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_auth_setup(self):
        """Test admin user setup"""
        success, response = self.run_test(
            "Setup Admin User",
            "POST",
            "api/auth/setup",
            200
        )
        
        if success:
            print(f"   ✓ Admin setup: {response.get('message', 'N/A')}")
            if 'username' in response:
                print(f"   ✓ Username: {response['username']}")
        
        return success

    def test_auth_login(self):
        """Test admin login with admin/admin123"""
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login (admin/admin123)",
            "POST",
            "api/auth/login",
            200,
            data=login_data
        )
        
        if success:
            self.auth_token = response.get('access_token')
            print(f"   ✓ Login successful, token received: {self.auth_token[:20]}..." if self.auth_token else "No token")
            print(f"   ✓ User info: {response.get('user', {})}")
        
        return success

    def test_auth_me(self):
        """Test getting current user info"""
        if not self.auth_token:
            print("⚠️  Skipping auth/me test - no token available")
            return False
            
        success, response = self.run_test(
            "Get Current User Info",
            "GET",
            "api/auth/me",
            200,
            auth_required=True
        )
        
        if success:
            print(f"   ✓ Current user: {response}")
        
        return success

    def test_statistics_api(self):
        """Test statistics endpoint"""
        success, response = self.run_test(
            "Get Statistics Data",
            "GET",
            "api/stats",
            200
        )
        
        if success:
            required_stats = ['daily_visits', 'weekly_visits', 'total_properties', 'total_visits']
            for stat in required_stats:
                if stat in response:
                    print(f"   ✓ {stat}: {response[stat]}")
                else:
                    print(f"   ⚠️  Missing stat: {stat}")
            
            # Check for top properties
            if 'top_properties' in response:
                print(f"   ✓ Top properties: {len(response['top_properties'])} items")
            
            # Check for visits by day
            if 'visits_by_day' in response:
                print(f"   ✓ Visits by day: {len(response['visits_by_day'])} days")
        
        return success

    def test_visit_tracking(self):
        """Test visit tracking endpoint"""
        success, response = self.run_test(
            "Track Visit",
            "POST",
            "api/track/visit?page=/admin/dashboard",
            200
        )
        
        if success:
            print(f"   ✓ Visit tracked: {response}")
        
        return success

    def test_agency_settings(self):
        """Test agency settings endpoint"""
        success, response = self.run_test(
            "Get Agency Settings",
            "GET",
            "api/agency",
            200
        )
        
        if success:
            required_fields = ['name', 'whatsapp', 'phone', 'email']
            for field in required_fields:
                if field not in response:
                    print(f"⚠️  Warning: Missing field '{field}' in agency settings")
                else:
                    print(f"   ✓ {field}: {response[field]}")
        
        return success
        """Test agency settings endpoint"""
        success, response = self.run_test(
            "Get Agency Settings",
            "GET",
            "api/agency",
            200
        )
        
        if success:
            required_fields = ['name', 'whatsapp', 'phone', 'email']
            for field in required_fields:
                if field not in response:
                    print(f"⚠️  Warning: Missing field '{field}' in agency settings")
                else:
                    print(f"   ✓ {field}: {response[field]}")
        
        return success

    def test_properties_endpoints(self):
        """Test all property-related endpoints"""
        # Test get all properties
        success1, properties_response = self.run_test(
            "Get All Properties",
            "GET",
            "api/properties",
            200
        )
        
        # Test featured properties
        success2, featured_response = self.run_test(
            "Get Featured Properties",
            "GET",
            "api/properties/featured",
            200
        )
        
        # Test properties with filters
        success3, filtered_response = self.run_test(
            "Get Properties with Location Filter",
            "GET",
            "api/properties",
            200,
            params={'location': 'Punta Cana'}
        )
        
        # Test properties with pagination
        success4, paginated_response = self.run_test(
            "Get Properties with Pagination",
            "GET",
            "api/properties",
            200,
            params={'page': 1, 'limit': 3}
        )
        
        # Test individual property if we have properties
        property_id = None
        if success1 and properties_response.get('properties'):
            property_id = properties_response['properties'][0]['id']
            success5, property_response = self.run_test(
                "Get Individual Property",
                "GET",
                f"api/properties/{property_id}",
                200
            )
        else:
            success5 = False
            print("⚠️  No properties found to test individual property endpoint")
        
        return all([success1, success2, success3, success4, success5])

    def test_seed_data(self):
        """Test seed data endpoint"""
        success, response = self.run_test(
            "Seed Sample Data",
            "POST",
            "api/seed",
            200
        )
        return success

    def test_contact_endpoint(self):
        """Test contact message endpoint"""
        test_message = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+1234567890",
            "message": "This is a test message from automated testing."
        }
        
        success, response = self.run_test(
            "Send Contact Message",
            "POST",
            "api/contact",
            200,
            data=test_message
        )
        
        if success:
            print(f"   ✓ Message ID: {response.get('id', 'N/A')}")
        
        return success

    def test_locations_crud(self):
        """Test location CRUD operations"""
        # Test get locations
        success1, locations_response = self.run_test(
            "Get All Locations",
            "GET",
            "api/locations",
            200
        )
        
        # Test create location
        test_location = {
            "name": "Test Location",
            "description": "Test location for automated testing",
            "is_active": True
        }
        
        success2, create_response = self.run_test(
            "Create Location",
            "POST",
            "api/locations",
            200,
            data=test_location
        )
        
        location_id = None
        if success2:
            location_id = create_response.get('id')
            print(f"   ✓ Created location ID: {location_id}")
        
        # Test update location if we created one
        success3 = True
        if location_id:
            update_data = {"description": "Updated test location"}
            success3, update_response = self.run_test(
                "Update Location",
                "PUT",
                f"api/locations/{location_id}",
                200,
                data=update_data
            )
        
        # Test delete location if we created one
        success4 = True
        if location_id:
            success4, delete_response = self.run_test(
                "Delete Location",
                "DELETE",
                f"api/locations/{location_id}",
                200
            )
        
        return all([success1, success2, success3, success4])

    def test_properties_crud(self):
        """Test property CRUD operations"""
        # First get locations to use in property creation
        success_loc, locations_response = self.run_test(
            "Get Locations for Property",
            "GET",
            "api/locations",
            200
        )
        
        location_name = "Punta Cana"  # Default location
        if success_loc and locations_response:
            location_name = locations_response[0]['name']
        
        # Test create property
        test_property = {
            "title": "Test Property",
            "description": "Test property for automated testing",
            "price": 150000,
            "currency": "USD",
            "location": location_name,
            "address": "Test Address",
            "bedrooms": 3,
            "bathrooms": 2,
            "area": 120.5,
            "property_type": "Casa",
            "images": [{"url": "https://example.com/test.jpg", "alt": "Test image"}],
            "is_featured": False,
            "amenities": ["Test Amenity"]
        }
        
        success1, create_response = self.run_test(
            "Create Property",
            "POST",
            "api/properties",
            200,
            data=test_property
        )
        
        property_id = None
        if success1:
            property_id = create_response.get('id')
            print(f"   ✓ Created property ID: {property_id}")
        
        # Test update property if we created one
        success2 = True
        if property_id:
            update_data = {"price": 175000, "is_featured": True}
            success2, update_response = self.run_test(
                "Update Property",
                "PUT",
                f"api/properties/{property_id}",
                200,
                data=update_data
            )
        
        # Test delete property if we created one
        success3 = True
        if property_id:
            success3, delete_response = self.run_test(
                "Delete Property",
                "DELETE",
                f"api/properties/{property_id}",
                200
            )
        
        return all([success1, success2, success3])

    def test_agency_settings_update(self):
        """Test agency settings update"""
        # First get current settings
        success1, current_settings = self.run_test(
            "Get Current Agency Settings",
            "GET",
            "api/agency",
            200
        )
        
        if not success1:
            return False
        
        # Test update settings
        update_data = {
            "name": "Updated Test Agency Name",
            "phone": "+1234567890"
        }
        
        success2, update_response = self.run_test(
            "Update Agency Settings",
            "PUT",
            "api/agency",
            200,
            data=update_data
        )
        
        if success2:
            print(f"   ✓ Updated agency name: {update_response.get('name')}")
        
        # Restore original settings
        restore_data = {
            "name": current_settings.get('name'),
            "phone": current_settings.get('phone')
        }
        
        success3, restore_response = self.run_test(
            "Restore Agency Settings",
            "PUT",
            "api/agency",
            200,
            data=restore_data
        )
        
        return all([success1, success2, success3])

    def test_contact_messages_crud(self):
        """Test contact messages CRUD operations"""
        # Test get contact messages
        success1, messages_response = self.run_test(
            "Get Contact Messages",
            "GET",
            "api/contact",
            200
        )
        
        # Create a test message first
        test_message = {
            "name": "Test Admin User",
            "email": "admin@test.com",
            "phone": "+1234567890",
            "message": "Test message for admin panel testing."
        }
        
        success2, create_response = self.run_test(
            "Create Contact Message for Admin",
            "POST",
            "api/contact",
            200,
            data=test_message
        )
        
        message_id = None
        if success2:
            message_id = create_response.get('id')
            print(f"   ✓ Created message ID: {message_id}")
        
        # Test delete message if we created one
        success3 = True
        if message_id:
            success3, delete_response = self.run_test(
                "Delete Contact Message",
                "DELETE",
                f"api/contact/{message_id}",
                200
            )
        
        return all([success1, success2, success3])

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "api/",
            200
        )
        return success

def main():
    print("🏠 Real Estate Website API Testing - Admin Panel Features")
    print("=" * 60)
    
    # Setup
    tester = RealEstateAPITester()
    
    # Run all tests
    print("\n📋 Running Backend API Tests...")
    
    # Test API root
    tester.test_api_root()
    
    # NEW: Test Authentication Features
    print("\n🔐 Testing Authentication Features...")
    tester.test_auth_setup()
    tester.test_auth_login()
    tester.test_auth_me()
    
    # NEW: Test Statistics Features
    print("\n📊 Testing Statistics Features...")
    tester.test_statistics_api()
    tester.test_visit_tracking()
    
    # Test agency settings
    tester.test_agency_settings()
    
    # Seed data first
    tester.test_seed_data()
    
    # Test properties endpoints
    tester.test_properties_endpoints()
    
    # Test contact endpoint
    tester.test_contact_endpoint()
    
    # Test Admin Panel CRUD Operations
    print("\n🔧 Testing Admin Panel CRUD Operations...")
    
    # Test locations CRUD
    tester.test_locations_crud()
    
    # Test properties CRUD
    tester.test_properties_crud()
    
    # Test agency settings update
    tester.test_agency_settings_update()
    
    # Test contact messages CRUD
    tester.test_contact_messages_crud()
    
    # Print final results
    print(f"\n📊 Test Results:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests:")
        for test in tester.failed_tests:
            error_msg = test.get('error', f"Expected {test.get('expected')}, got {test.get('actual')}")
            print(f"   - {test['name']}: {error_msg}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())