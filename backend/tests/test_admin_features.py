"""
Backend API tests for Real Estate Admin Panel
Testing: Login, Properties CRUD, Statistics, Brand/Logo settings
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuthentication:
    """Test admin authentication flows"""
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        assert "user" in data, "Response should contain user info"
        assert data["user"]["username"] == "admin"
        assert data["user"]["role"] == "admin"
        print("PASS: Admin login successful")
    
    def test_admin_login_wrong_password(self):
        """Test admin login with wrong credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Wrong password returns 401")


class TestStatistics:
    """Test Resumen/Statistics tab - should show counters WITHOUT daily/weekly visits"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_statistics(self):
        """Test statistics endpoint returns counts for properties, locations, messages"""
        response = requests.get(f"{BASE_URL}/api/stats", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify the counters that should be shown
        assert "total_properties" in data, "Should have total_properties count"
        assert "total_locations" in data, "Should have total_locations count"
        assert "total_messages" in data, "Should have total_messages count"
        
        # Verify counts are integers
        assert isinstance(data["total_properties"], int), "total_properties should be int"
        assert isinstance(data["total_locations"], int), "total_locations should be int"
        assert isinstance(data["total_messages"], int), "total_messages should be int"
        
        print(f"PASS: Stats - Properties: {data['total_properties']}, Locations: {data['total_locations']}, Messages: {data['total_messages']}")


class TestBrandAndLogo:
    """Test Marca y Logo section - agency settings and hero images"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_agency_settings(self):
        """Test getting agency settings including hero_images"""
        response = requests.get(f"{BASE_URL}/api/agency", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Check essential fields exist
        assert "name" in data, "Should have agency name"
        assert "logo_url" in data, "Should have logo_url field"
        assert "hero_images" in data, "Should have hero_images array for portada images"
        
        # Verify hero_images is a list
        assert isinstance(data["hero_images"], list), "hero_images should be a list"
        
        print(f"PASS: Agency settings retrieved - Name: {data['name']}, Hero images count: {len(data['hero_images'])}")
    
    def test_update_agency_settings(self):
        """Test updating agency settings"""
        update_data = {
            "name": "TEST_Propiedades Turísticas RD Updated",
            "hero_headline": "TEST_Encuentra tu Paraíso"
        }
        response = requests.put(f"{BASE_URL}/api/agency", json=update_data, headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Verify the update
        verify_response = requests.get(f"{BASE_URL}/api/agency", headers=self.headers)
        data = verify_response.json()
        assert data["name"] == "TEST_Propiedades Turísticas RD Updated"
        
        # Revert the changes
        requests.put(f"{BASE_URL}/api/agency", json={
            "name": "Propiedades Turísticas RD",
            "hero_headline": "Encuentra tu Paraíso en RD"
        }, headers=self.headers)
        
        print("PASS: Agency settings update works correctly")


class TestLocations:
    """Test locations CRUD for properties"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_locations(self):
        """Test getting all locations"""
        response = requests.get(f"{BASE_URL}/api/locations", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Should return list of locations"
        print(f"PASS: Got {len(data)} locations")
    
    def test_create_and_delete_location(self):
        """Test creating and deleting a location"""
        # Create
        create_response = requests.post(f"{BASE_URL}/api/locations", json={
            "name": "TEST_Nueva Ubicacion",
            "description": "Test location for automated testing",
            "is_active": True
        }, headers=self.headers)
        assert create_response.status_code == 200, f"Create failed: {create_response.status_code}"
        created = create_response.json()
        location_id = created["id"]
        
        # Verify created
        assert created["name"] == "TEST_Nueva Ubicacion"
        
        # Delete
        delete_response = requests.delete(f"{BASE_URL}/api/locations/{location_id}", headers=self.headers)
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.status_code}"
        
        print("PASS: Location create and delete works")


class TestPropertiesCRUD:
    """Test property CRUD operations - the core functionality requested"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token and locations"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Get locations for property creation
        loc_response = requests.get(f"{BASE_URL}/api/locations", headers=self.headers)
        self.locations = loc_response.json()
    
    def test_list_properties(self):
        """Test listing properties"""
        response = requests.get(f"{BASE_URL}/api/properties", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "properties" in data, "Should have properties array"
        assert "total" in data, "Should have total count"
        print(f"PASS: Listed {len(data['properties'])} properties (total: {data['total']})")
    
    def test_create_property_success(self):
        """Test creating a new property with all required fields"""
        location_name = self.locations[0]["name"] if self.locations else "Punta Cana"
        
        property_data = {
            "title": "TEST_Nueva Casa de Prueba",
            "description": "Esta es una propiedad de prueba para verificar la funcionalidad",
            "price": 250000,
            "currency": "USD",
            "location": location_name,
            "address": "Calle Test 123",
            "bedrooms": 3,
            "bathrooms": 2,
            "area": 150,
            "property_type": "Casa",
            "status": "Disponible",
            "images": [],
            "video_urls": [],
            "is_featured": False,
            "amenities": ["Piscina", "Jardín"]
        }
        
        response = requests.post(f"{BASE_URL}/api/properties", json=property_data, headers=self.headers)
        assert response.status_code == 200, f"Create failed: {response.status_code} - {response.text}"
        
        created = response.json()
        assert created["title"] == "TEST_Nueva Casa de Prueba"
        assert created["price"] == 250000
        assert created["location"] == location_name
        assert "id" in created
        
        # Store ID for cleanup
        self.created_property_id = created["id"]
        
        # Verify GET returns the property
        get_response = requests.get(f"{BASE_URL}/api/properties/{created['id']}", headers=self.headers)
        assert get_response.status_code == 200
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/properties/{created['id']}", headers=self.headers)
        
        print("PASS: Property creation with all required fields works")
    
    def test_update_property(self):
        """Test updating an existing property"""
        location_name = self.locations[0]["name"] if self.locations else "Punta Cana"
        
        # First create a property
        property_data = {
            "title": "TEST_Propiedad Para Editar",
            "description": "Esta propiedad será editada",
            "price": 100000,
            "currency": "USD",
            "location": location_name,
            "bedrooms": 2,
            "bathrooms": 1,
            "area": 100,
            "property_type": "Apartamento",
            "status": "Disponible"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/properties", json=property_data, headers=self.headers)
        assert create_response.status_code == 200
        property_id = create_response.json()["id"]
        
        # Update the property
        update_data = {
            "title": "TEST_Propiedad Editada",
            "price": 150000,
            "status": "Reservado"
        }
        
        update_response = requests.put(f"{BASE_URL}/api/properties/{property_id}", json=update_data, headers=self.headers)
        assert update_response.status_code == 200, f"Update failed: {update_response.status_code}"
        
        updated = update_response.json()
        assert updated["title"] == "TEST_Propiedad Editada"
        assert updated["price"] == 150000
        assert updated["status"] == "Reservado"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/properties/{property_id}", headers=self.headers)
        
        print("PASS: Property update works correctly")
    
    def test_delete_property(self):
        """Test deleting a property"""
        location_name = self.locations[0]["name"] if self.locations else "Punta Cana"
        
        # Create a property to delete
        property_data = {
            "title": "TEST_Propiedad Para Eliminar",
            "description": "Esta propiedad será eliminada",
            "price": 50000,
            "currency": "USD",
            "location": location_name,
            "bedrooms": 1,
            "bathrooms": 1,
            "area": 50,
            "property_type": "Apartamento",
            "status": "Disponible"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/properties", json=property_data, headers=self.headers)
        property_id = create_response.json()["id"]
        
        # Delete the property
        delete_response = requests.delete(f"{BASE_URL}/api/properties/{property_id}", headers=self.headers)
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.status_code}"
        
        # Verify it's deleted
        get_response = requests.get(f"{BASE_URL}/api/properties/{property_id}", headers=self.headers)
        assert get_response.status_code == 404, "Property should not exist after deletion"
        
        print("PASS: Property deletion works correctly")


class TestPropertyValidation:
    """Test property validation - required fields"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_create_property_missing_title(self):
        """Test that property creation fails without title"""
        property_data = {
            "description": "Propiedad sin título",
            "price": 100000,
            "location": "Punta Cana",
            "bedrooms": 2,
            "bathrooms": 1,
            "area": 100,
            "property_type": "Casa"
        }
        
        response = requests.post(f"{BASE_URL}/api/properties", json=property_data, headers=self.headers)
        # Pydantic validation should return 422
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("PASS: Missing title validation works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
