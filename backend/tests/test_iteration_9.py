"""
Backend API tests for Iteration 9 - Real Estate Website
Testing: Admin/Agent login, role-based access, forms, logo/hero config, agent profile
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAdminLogin:
    """Test admin login with admin/admin123"""
    
    def test_admin_login_success(self):
        """Admin login with admin/admin123 should work"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        assert data["user"]["username"] == "admin"
        assert data["user"]["role"] == "admin"
        print("PASS: Admin login with admin/admin123 works")


class TestAgentLogin:
    """Test agent login with agente1/agente123"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Ensure agent user exists"""
        # First login as admin to create agent if needed
        admin_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        self.admin_token = admin_response.json()["access_token"]
        self.admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Check if agente1 exists, create if not
        users_response = requests.get(f"{BASE_URL}/api/users", headers=self.admin_headers)
        users = users_response.json()
        agent_exists = any(u["username"] == "agente1" for u in users)
        
        if not agent_exists:
            # Create agent user
            requests.post(f"{BASE_URL}/api/users", json={
                "username": "agente1",
                "password": "agente123",
                "role": "agente",
                "nombre_completo": "Agente de Prueba",
                "telefono_whatsapp": "+18091234567"
            }, headers=self.admin_headers)
    
    def test_agent_login_success(self):
        """Agent login with agente1/agente123 should work"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "agente1",
            "password": "agente123"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        assert data["user"]["username"] == "agente1"
        assert data["user"]["role"] == "agente"
        print("PASS: Agent login with agente1/agente123 works")


class TestAgentRestrictions:
    """Test that agents cannot access admin-only endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get agent token"""
        # Ensure agent exists first
        admin_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        admin_token = admin_response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        users_response = requests.get(f"{BASE_URL}/api/users", headers=admin_headers)
        users = users_response.json()
        agent_exists = any(u["username"] == "agente1" for u in users)
        
        if not agent_exists:
            requests.post(f"{BASE_URL}/api/users", json={
                "username": "agente1",
                "password": "agente123",
                "role": "agente"
            }, headers=admin_headers)
        
        # Now login as agent
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "agente1",
            "password": "agente123"
        })
        self.agent_token = response.json()["access_token"]
        self.agent_headers = {"Authorization": f"Bearer {self.agent_token}"}
    
    def test_agent_cannot_access_users_list(self):
        """Agent should get 403 when trying to access users list"""
        response = requests.get(f"{BASE_URL}/api/users", headers=self.agent_headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("PASS: Agent cannot access /api/users (403)")
    
    def test_agent_cannot_create_users(self):
        """Agent should get 403 when trying to create users"""
        response = requests.post(f"{BASE_URL}/api/users", json={
            "username": "test_user",
            "password": "test123",
            "role": "agente"
        }, headers=self.agent_headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("PASS: Agent cannot create users (403)")


class TestAgentProfileEdit:
    """Test that agents can edit their own profile"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get agent token and user ID"""
        # Ensure agent exists
        admin_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        admin_token = admin_response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        users_response = requests.get(f"{BASE_URL}/api/users", headers=admin_headers)
        users = users_response.json()
        agent = next((u for u in users if u["username"] == "agente1"), None)
        
        if not agent:
            create_response = requests.post(f"{BASE_URL}/api/users", json={
                "username": "agente1",
                "password": "agente123",
                "role": "agente"
            }, headers=admin_headers)
            agent = create_response.json()
        
        self.agent_id = agent["id"]
        
        # Login as agent
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "agente1",
            "password": "agente123"
        })
        self.agent_token = response.json()["access_token"]
        self.agent_headers = {"Authorization": f"Bearer {self.agent_token}"}
    
    def test_agent_can_update_own_profile(self):
        """Agent should be able to update their own profile"""
        response = requests.put(
            f"{BASE_URL}/api/users/{self.agent_id}/profile",
            json={
                "nombre_completo": "TEST_Agente Actualizado",
                "telefono_whatsapp": "+18099999999"
            },
            headers=self.agent_headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify the update
        get_response = requests.get(f"{BASE_URL}/api/users/{self.agent_id}/profile", headers=self.agent_headers)
        data = get_response.json()
        assert data["nombre_completo"] == "TEST_Agente Actualizado"
        
        # Revert
        requests.put(
            f"{BASE_URL}/api/users/{self.agent_id}/profile",
            json={"nombre_completo": "Agente de Prueba"},
            headers=self.agent_headers
        )
        
        print("PASS: Agent can update own profile")


class TestLogoPositionConfig:
    """Test logo position configuration in agency settings"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_logo_position_field_exists(self):
        """Agency settings should have logo_position field"""
        response = requests.get(f"{BASE_URL}/api/agency", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "logo_position" in data, "Should have logo_position field"
        print(f"PASS: logo_position field exists, value: {data['logo_position']}")
    
    def test_update_logo_position(self):
        """Should be able to update logo_position"""
        # Get current value
        get_response = requests.get(f"{BASE_URL}/api/agency", headers=self.headers)
        original_position = get_response.json().get("logo_position", "top-left")
        
        # Update to different position
        response = requests.put(f"{BASE_URL}/api/agency", json={
            "logo_position": "center"
        }, headers=self.headers)
        assert response.status_code == 200
        
        # Verify
        verify_response = requests.get(f"{BASE_URL}/api/agency", headers=self.headers)
        assert verify_response.json()["logo_position"] == "center"
        
        # Revert
        requests.put(f"{BASE_URL}/api/agency", json={
            "logo_position": original_position
        }, headers=self.headers)
        
        print("PASS: Logo position can be updated")


class TestHeroConfiguration:
    """Test hero video/images configuration"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_hero_images_field_exists(self):
        """Agency settings should have hero_images array"""
        response = requests.get(f"{BASE_URL}/api/agency", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "hero_images" in data, "Should have hero_images field"
        assert isinstance(data["hero_images"], list), "hero_images should be a list"
        print(f"PASS: hero_images field exists, count: {len(data['hero_images'])}")
    
    def test_hero_video_url_field_exists(self):
        """Agency settings should have hero_video_url field"""
        response = requests.get(f"{BASE_URL}/api/agency", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "hero_video_url" in data, "Should have hero_video_url field"
        print(f"PASS: hero_video_url field exists")
    
    def test_update_hero_video_url(self):
        """Should be able to update hero_video_url"""
        response = requests.put(f"{BASE_URL}/api/agency", json={
            "hero_video_url": "https://youtube.com/watch?v=test123"
        }, headers=self.headers)
        assert response.status_code == 200
        
        # Verify
        verify_response = requests.get(f"{BASE_URL}/api/agency", headers=self.headers)
        assert verify_response.json()["hero_video_url"] == "https://youtube.com/watch?v=test123"
        
        # Clear it
        requests.put(f"{BASE_URL}/api/agency", json={
            "hero_video_url": ""
        }, headers=self.headers)
        
        print("PASS: Hero video URL can be updated")


class TestContactForm:
    """Test public contact form endpoint"""
    
    def test_submit_contact_form(self):
        """Public contact form should work without auth"""
        response = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_Usuario de Prueba",
            "email": "test@example.com",
            "phone": "+18091234567",
            "message": "Este es un mensaje de prueba para el formulario de contacto"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["name"] == "TEST_Usuario de Prueba"
        assert "id" in data
        
        # Cleanup - delete the test message
        admin_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        admin_token = admin_response.json()["access_token"]
        requests.delete(f"{BASE_URL}/api/contact/{data['id']}", headers={"Authorization": f"Bearer {admin_token}"})
        
        print("PASS: Contact form submission works")


class TestSellRequestForm:
    """Test 'Vende tu Propiedad' form endpoint"""
    
    def test_submit_sell_request(self):
        """Sell request form should work without auth"""
        response = requests.post(f"{BASE_URL}/api/sell-requests", json={
            "name": "TEST_Vendedor de Prueba",
            "phone": "+18091234567",
            "email": "vendedor@example.com",
            "property_description": "Casa de 3 habitaciones en Santo Domingo",
            "property_type": "Casa",
            "location": "Santo Domingo"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["name"] == "TEST_Vendedor de Prueba"
        assert data["status"] == "pending"
        assert "id" in data
        
        # Cleanup
        admin_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        admin_token = admin_response.json()["access_token"]
        requests.delete(f"{BASE_URL}/api/sell-requests/{data['id']}", headers={"Authorization": f"Bearer {admin_token}"})
        
        print("PASS: Sell request form submission works")


class TestJobApplicationForm:
    """Test 'Trabaja con nosotros' form endpoint"""
    
    def test_submit_job_application(self):
        """Job application form should work without auth"""
        response = requests.post(f"{BASE_URL}/api/job-applications", json={
            "name": "TEST_Candidato de Prueba",
            "phone": "+18091234567",
            "email": "candidato@example.com",
            "message": "Me gustaría trabajar como agente inmobiliario",
            "position": "Agente Inmobiliario"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["name"] == "TEST_Candidato de Prueba"
        assert data["status"] == "pending"
        assert "id" in data
        
        # Cleanup
        admin_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        admin_token = admin_response.json()["access_token"]
        requests.delete(f"{BASE_URL}/api/job-applications/{data['id']}", headers={"Authorization": f"Bearer {admin_token}"})
        
        print("PASS: Job application form submission works")


class TestLogoUpload:
    """Test logo upload endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_upload_endpoint_exists(self):
        """Upload endpoint should exist and reject invalid files"""
        # Try to upload without a file - should get 422 (validation error)
        response = requests.post(f"{BASE_URL}/api/upload", headers=self.headers)
        # 422 means endpoint exists but validation failed (no file)
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("PASS: Upload endpoint exists and validates input")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
