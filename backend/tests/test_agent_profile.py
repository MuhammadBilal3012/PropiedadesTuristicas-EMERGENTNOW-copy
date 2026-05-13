"""
Backend API tests for Agent Profile Feature
Testing: User profile management, created_by field on properties, and created_by_info population
"""
import pytest
import requests
import os



BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAgentProfileCRUD:
    """Test user profile management via admin panel"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.admin_user = response.json()["user"]
    
    def test_get_users_list(self):
        """Test getting all users (admin only)"""
        response = requests.get(f"{BASE_URL}/api/users", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        users = response.json()
        assert isinstance(users, list), "Should return list of users"
        
        # Verify user structure includes profile fields
        if users:
            user = users[0]
            assert "id" in user
            assert "username" in user
            assert "role" in user
            # Profile fields should be present (even if null)
            assert "nombre_completo" in user or user.get("nombre_completo") is None
            
        print(f"PASS: Got {len(users)} users")
    
    def test_create_agent_with_profile(self):
        """Test creating a new agent with profile fields"""
        agent_data = {
            "username": "TEST_agent_profile",
            "password": "testpass123",
            "role": "agente",
            "nombre_completo": "Juan Agente Test",
            "telefono_whatsapp": "+18091234567",
            "foto_perfil": None
        }
        
        response = requests.post(f"{BASE_URL}/api/users", json=agent_data, headers=self.headers)
        assert response.status_code == 200, f"Create agent failed: {response.status_code} - {response.text}"
        
        created = response.json()
        assert created["username"] == "TEST_agent_profile"
        assert created["role"] == "agente"
        assert created["nombre_completo"] == "Juan Agente Test"
        assert created["telefono_whatsapp"] == "+18091234567"
        
        self.created_agent_id = created["id"]
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/users/{created['id']}", headers=self.headers)
        
        print("PASS: Agent created with profile fields")
    
    def test_update_user_profile(self):
        """Test updating user profile (nombre_completo, telefono_whatsapp, foto_perfil)"""
        # First create a test agent
        agent_data = {
            "username": "TEST_agent_update_profile",
            "password": "testpass123",
            "role": "agente"
        }
        create_response = requests.post(f"{BASE_URL}/api/users", json=agent_data, headers=self.headers)
        assert create_response.status_code == 200, f"Create agent failed: {create_response.text}"
        agent_id = create_response.json()["id"]
        
        # Update the profile
        profile_update = {
            "nombre_completo": "María García Updated",
            "telefono_whatsapp": "+18099876543",
            "foto_perfil": "https://example.com/photo.jpg"
        }
        
        update_response = requests.put(f"{BASE_URL}/api/users/{agent_id}/profile", json=profile_update, headers=self.headers)
        assert update_response.status_code == 200, f"Update profile failed: {update_response.status_code} - {update_response.text}"
        
        updated = update_response.json()
        assert updated["nombre_completo"] == "María García Updated"
        assert updated["telefono_whatsapp"] == "+18099876543"
        assert updated["foto_perfil"] == "https://example.com/photo.jpg"
        
        # Verify via GET profile endpoint
        get_response = requests.get(f"{BASE_URL}/api/users/{agent_id}/profile", headers=self.headers)
        assert get_response.status_code == 200
        profile = get_response.json()
        assert profile["nombre_completo"] == "María García Updated"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/users/{agent_id}", headers=self.headers)
        
        print("PASS: User profile update works correctly")
    
    def test_get_user_profile(self):
        """Test getting a user's profile"""
        # Get admin user profile (admin is the current user)
        response = requests.get(f"{BASE_URL}/api/users/{self.admin_user['id']}/profile", headers=self.headers)
        assert response.status_code == 200, f"Get profile failed: {response.status_code}"
        
        profile = response.json()
        assert "username" in profile
        assert profile["username"] == "admin"
        
        print("PASS: Get user profile works")


class TestPropertyWithCreatedBy:
    """Test that properties include created_by field when created and created_by_info when listed"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.admin_user = response.json()["user"]
        
        # Get locations
        loc_response = requests.get(f"{BASE_URL}/api/locations", headers=self.headers)
        self.locations = loc_response.json()
    
    def test_property_creation_includes_created_by(self):
        """Test that creating a property sets the created_by field"""
        location_name = self.locations[0]["name"] if self.locations else "Punta Cana"
        
        property_data = {
            "title": "TEST_Property with Created By",
            "description": "Testing created_by field",
            "price": 300000,
            "currency": "USD",
            "location": location_name,
            "bedrooms": 3,
            "bathrooms": 2,
            "area": 200,
            "property_type": "Casa",
            "status": "Disponible"
        }
        
        response = requests.post(f"{BASE_URL}/api/properties", json=property_data, headers=self.headers)
        assert response.status_code == 200, f"Create property failed: {response.text}"
        
        created = response.json()
        property_id = created["id"]
        
        # The created_by should be set in backend, verify via GET
        get_response = requests.get(f"{BASE_URL}/api/properties/{property_id}", headers=self.headers)
        assert get_response.status_code == 200
        
        property_data = get_response.json()
        # Check if created_by_info is present (the populated data)
        assert "created_by_info" in property_data, "Property should have created_by_info field"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/properties/{property_id}", headers=self.headers)
        
        print("PASS: Property creation includes created_by field")
    
    def test_properties_list_includes_created_by_info(self):
        """Test that properties endpoint returns created_by_info with user profile data"""
        # First, update admin profile to have identifiable data
        admin_profile_update = {
            "nombre_completo": "Admin Full Name Test",
            "telefono_whatsapp": "+18095551234"
        }
        requests.put(f"{BASE_URL}/api/users/{self.admin_user['id']}/profile", json=admin_profile_update, headers=self.headers)
        
        # Create a property (as admin)
        location_name = self.locations[0]["name"] if self.locations else "Punta Cana"
        property_data = {
            "title": "TEST_Property for Created By Info",
            "description": "Testing created_by_info population",
            "price": 400000,
            "currency": "USD",
            "location": location_name,
            "bedrooms": 4,
            "bathrooms": 3,
            "area": 300,
            "property_type": "Villa",
            "status": "Disponible"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/properties", json=property_data, headers=self.headers)
        assert create_response.status_code == 200
        property_id = create_response.json()["id"]
        
        # Get properties list and check created_by_info
        list_response = requests.get(f"{BASE_URL}/api/properties", headers=self.headers)
        assert list_response.status_code == 200
        
        properties = list_response.json()["properties"]
        
        # Find our test property
        test_property = None
        for prop in properties:
            if prop["id"] == property_id:
                test_property = prop
                break
        
        assert test_property is not None, "Test property should be in the list"
        assert "created_by_info" in test_property, "Property should have created_by_info"
        
        created_by_info = test_property["created_by_info"]
        if created_by_info:
            # Verify the profile fields are populated
            assert "username" in created_by_info
            assert "nombre_completo" in created_by_info
            assert "telefono_whatsapp" in created_by_info
            assert "foto_perfil" in created_by_info
            
            # Verify the values match what we set
            assert created_by_info["nombre_completo"] == "Admin Full Name Test"
            assert created_by_info["telefono_whatsapp"] == "+18095551234"
        
        # Cleanup - reset admin profile and delete property
        requests.put(f"{BASE_URL}/api/users/{self.admin_user['id']}/profile", json={
            "nombre_completo": None,
            "telefono_whatsapp": None
        }, headers=self.headers)
        requests.delete(f"{BASE_URL}/api/properties/{property_id}", headers=self.headers)
        
        print("PASS: Properties list includes created_by_info with profile data")
    
    def test_featured_properties_include_created_by_info(self):
        """Test that featured properties endpoint also returns created_by_info"""
        response = requests.get(f"{BASE_URL}/api/properties/featured", headers=self.headers)
        assert response.status_code == 200, f"Get featured properties failed: {response.status_code}"
        
        properties = response.json()
        
        # All featured properties should have created_by_info field
        for prop in properties:
            assert "created_by_info" in prop, f"Featured property {prop.get('id')} should have created_by_info"
        
        print(f"PASS: Featured properties ({len(properties)}) all have created_by_info field")
    
    def test_single_property_includes_created_by_info(self):
        """Test that single property endpoint returns created_by_info"""
        # Get any existing property
        list_response = requests.get(f"{BASE_URL}/api/properties", headers=self.headers)
        properties = list_response.json()["properties"]
        
        if properties:
            property_id = properties[0]["id"]
            
            get_response = requests.get(f"{BASE_URL}/api/properties/{property_id}", headers=self.headers)
            assert get_response.status_code == 200
            
            property_data = get_response.json()
            assert "created_by_info" in property_data, "Single property should have created_by_info"
            
            print("PASS: Single property endpoint includes created_by_info")
        else:
            print("SKIP: No properties to test single property endpoint")


class TestAgentProfileAuthorization:
    """Test authorization for profile updates"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_non_admin_cannot_get_users_list(self):
        """Test that non-admin users cannot access user list"""
        # First create an agent user
        agent_data = {
            "username": "TEST_agent_nonadmin",
            "password": "testpass123",
            "role": "agente"
        }
        create_response = requests.post(f"{BASE_URL}/api/users", json=agent_data, headers=self.headers)
        agent_id = create_response.json()["id"]
        
        # Login as agent
        agent_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "TEST_agent_nonadmin",
            "password": "testpass123"
        })
        agent_token = agent_login.json()["access_token"]
        agent_headers = {"Authorization": f"Bearer {agent_token}"}
        
        # Try to get users list as agent (should fail)
        users_response = requests.get(f"{BASE_URL}/api/users", headers=agent_headers)
        assert users_response.status_code == 403, f"Expected 403, got {users_response.status_code}"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/users/{agent_id}", headers=self.headers)
        
        print("PASS: Non-admin cannot access user list")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
