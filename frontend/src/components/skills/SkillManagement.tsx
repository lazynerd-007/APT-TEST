import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTags, FaFilter } from 'react-icons/fa';
import skillsService, { Skill, SkillCategory } from '../../services/skillsService';

interface SkillManagementProps {
  // Optional props for customization
  onSkillCreated?: (skill: Skill) => void;
  onSkillUpdated?: (skill: Skill) => void;
  onSkillDeleted?: (id: string) => void;
}

const SkillManagement: React.FC<SkillManagementProps> = ({
  onSkillCreated,
  onSkillUpdated,
  onSkillDeleted
}) => {
  // State for skills and categories
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [skillsLoading, setSkillsLoading] = useState<boolean>(true);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);

  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  // State for form
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: 'beginner' as Skill['difficulty'],
  });

  // Category form state
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  });

  // Function to fetch skills with option for forced refresh
  const fetchSkills = React.useCallback(async (forceRefresh = false) => {
    try {
      setSkillsLoading(true);
      setError(prev => prev?.replace(/Failed to load skills\.?/, '').trim() || null);
      
      console.log(`Fetching skills${forceRefresh ? ' (forced refresh)' : ''}...`);
      const skillsData = await skillsService.getSkills({}, forceRefresh);
      console.log('Skills data received:', skillsData);
      
      // Ensure skills is always an array
      setSkills(Array.isArray(skillsData) ? skillsData : []);
      return true;
    } catch (skillError) {
      console.error('Error fetching skills:', skillError);
      setError(prev => {
        const baseError = prev ? prev : '';
        const newError = 'Failed to load skills. ' + (skillError.message || '');
        return baseError ? `${baseError}. ${newError}` : newError;
      });
      setSkills([]);
      return false;
    } finally {
      setSkillsLoading(false);
    }
  }, [setSkills, setError, setSkillsLoading]);

  // Function to fetch categories
  const fetchCategories = React.useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setError(prev => prev?.replace(/Failed to load skill categories\.?/, '').trim() || null);
      
      console.log('Fetching categories...');
      const categoriesData = await skillsService.getCategories();
      console.log('Categories data received:', categoriesData);
      
      // Ensure categories is always an array
      if (Array.isArray(categoriesData)) {
        console.log(`Setting ${categoriesData.length} categories`);
        setCategories(categoriesData);
      } else {
        console.warn('Categories data is not an array:', categoriesData);
        setCategories([]);
      }
      return true;
    } catch (categoryError) {
      console.error('Error fetching skill categories:', categoryError);
      setError(prev => {
        const baseError = prev ? prev : '';
        const newError = 'Failed to load skill categories. ' + (categoryError.message || '');
        return baseError ? `${baseError}. ${newError}` : newError;
      });
      setCategories([]);
      return false;
    } finally {
      setCategoriesLoading(false);
    }
  }, [setCategories, setError, setCategoriesLoading]);

  // Fetch skills and categories together
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both resources concurrently
      const results = await Promise.allSettled([
        fetchSkills(),
        fetchCategories()
      ]);
      
      // If both failed, set a general error
      if (results[0].status === 'rejected' && results[1].status === 'rejected') {
        setError('Failed to load data. Please check your connection and try again.');
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [fetchSkills, fetchCategories]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !loading) {
        console.log('Page became visible - refreshing data');
        fetchSkills(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh after component has been mounted for a short while
    const refreshTimer = setTimeout(() => {
      if (!loading) {
        console.log('Delayed refresh to ensure data consistency');
        fetchSkills(true);
      }
    }, 2000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(refreshTimer);
    };
  }, [loading, fetchSkills]);

  // Reset form when closing
  useEffect(() => {
    if (!isAddingSkill && !editingSkill) {
      setFormData({
        name: '',
        description: '',
        category: '',
        difficulty: 'beginner',
      });
    }
  }, [isAddingSkill, editingSkill]);

  // Set form data when editing
  useEffect(() => {
    if (editingSkill) {
      setFormData({
        name: editingSkill.name,
        description: editingSkill.description,
        category: editingSkill.category,
        difficulty: editingSkill.difficulty,
      });
    }
  }, [editingSkill]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle category form input changes
  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle skill submission
  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.category) {
        setError('Please fill in all required fields');
        return;
      }
      
      const skillData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty
      };

      console.log('Submitting skill data:', skillData);

      try {
        if (editingSkill) {
          // Update existing skill
          const updatedSkill = await skillsService.updateSkill(editingSkill.id, skillData);
          
          // Update local state
          setSkills(Array.isArray(skills) ? skills.map(skill =>
            skill.id === editingSkill.id ? { ...skill, ...updatedSkill } : skill
          ) : []);
          
          if (onSkillUpdated) {
            onSkillUpdated(updatedSkill);
          }
          
          setEditingSkill(null);
        } else {
          // Create new skill
          const newSkill = await skillsService.createSkill(skillData);
          
          // Update local state
          setSkills(Array.isArray(skills) ? [...skills, newSkill] : [newSkill]);
          
          if (onSkillCreated) {
            onSkillCreated(newSkill);
          }
          
          // Force refresh the skills list to ensure we have the latest data
          console.log('Refreshing skills list after create...');
          setTimeout(() => {
            fetchSkills(true).catch(err => {
              console.error('Error refreshing skills after create:', err);
            });
          }, 500); // Small delay to allow backend to process
        }
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: '',
          difficulty: 'beginner',
        });
        
        setIsAddingSkill(false);
        setError(null);
      } catch (err) {
        console.error('API Error:', err);
        
        // Check for authentication errors
        if (err.message && typeof err.message === 'string') {
          if (err.message.includes('Authentication failed') || 
              err.message.includes('Authentication required')) {
            // Display a more user-friendly message for auth errors
            setError(`${err.message} Please try logging out and logging back in to refresh your session.`);
            
            // Show a logout link
            const logoutLink = document.createElement('a');
            logoutLink.href = '/logout';
            logoutLink.innerText = 'Logout';
            logoutLink.className = 'text-blue-600 hover:underline ml-2';
            
            // Find the error message element and append the link
            setTimeout(() => {
              const errorElement = document.querySelector('.error-message');
              if (errorElement) {
                const span = document.createElement('span');
                span.innerHTML = ' <a href="/logout" class="text-blue-600 hover:underline">Logout</a>';
                errorElement.appendChild(span);
              }
            }, 100);
            
            return;
          }
        }
        
        if (err.response && err.response.data) {
          // Display more detailed error message from the API
          setError(`Failed to save skill: ${JSON.stringify(err.response.data)}`);
        } else {
          setError(`Failed to save skill: ${err.message || 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError(`An unexpected error occurred: ${err.message}`);
    }
  };

  // Handle category submission
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!categoryFormData.name) {
        setError('Category name is required');
        return;
      }
      
      console.log('Submitting category data:', categoryFormData);
      
      try {
        if (editingCategory) {
          // Update existing category
          const updatedCategory = await skillsService.updateCategory(editingCategory.id, categoryFormData);
          
          // Update local state
          setCategories(Array.isArray(categories) 
            ? categories.map(category => category.id === editingCategory.id ? updatedCategory : category) 
            : [updatedCategory]
          );
          
          setEditingCategory(null);
        } else {
          // Create new category
          const newCategory = await skillsService.createCategory(categoryFormData);
          
          // Update local state
          setCategories(Array.isArray(categories) ? [...categories, newCategory] : [newCategory]);
        }
        
        // Reset form
        setCategoryFormData({ name: '', description: '' });
        setIsAddingCategory(false);
        setError(null);
      } catch (err) {
        console.error('API Error:', err);
        if (err.response && err.response.data) {
          // Display more detailed error message from the API
          setError(`Failed to save category: ${JSON.stringify(err.response.data)}`);
        } else {
          setError(`Failed to save category: ${err.message || 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error('Error in form submission:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  // Handle skill deletion
  const handleDeleteSkill = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) {
      return;
    }
    
    try {
      await skillsService.deleteSkill(id);
      
      // Update local state
      setSkills(Array.isArray(skills) ? skills.filter(skill => skill.id !== id) : []);
      
      if (onSkillDeleted) {
        onSkillDeleted(id);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error deleting skill:', err);
      setError('Failed to delete skill. Please try again.');
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This will also delete all skills in this category.')) {
      return;
    }
    
    try {
      await skillsService.deleteCategory(id);
      
      // Update local state
      setCategories(Array.isArray(categories) ? categories.filter(category => category.id !== id) : []);
      
      setError(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
    }
  };

  // Filter skills based on search and filters
  const filteredSkills = Array.isArray(skills) ? skills.filter(skill => {
    // Check if skill has all required properties
    if (!skill || typeof skill !== 'object') {
      console.warn('Invalid skill object in filter:', skill);
      return false;
    }
    
    const matchesSearch = 
      (skill.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (skill.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (Array.isArray(skill.tags) && skill.tags.some(tag => 
        (tag?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      ));
    
    const matchesCategory = selectedCategory ? skill.category === selectedCategory : true;
    const matchesDifficulty = selectedDifficulty ? skill.difficulty === selectedDifficulty : true;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  }) : [];

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-soft p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Skill Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Add Category
          </button>
          <button
            onClick={() => setIsAddingSkill(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Add Skill
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6 error-message">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">{error}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {error.includes('Failed to load skills') && (
                  <button 
                    onClick={() => fetchSkills(true)}
                    disabled={skillsLoading}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {skillsLoading ? 'Loading Skills...' : 'Retry Loading Skills'}
                  </button>
                )}
                {error.includes('Failed to load skill categories') && (
                  <button 
                    onClick={() => fetchCategories()}
                    disabled={categoriesLoading}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {categoriesLoading ? 'Loading Categories...' : 'Retry Loading Categories'}
                  </button>
                )}
                <button 
                  onClick={fetchData}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {loading ? 'Loading...' : 'Retry All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          <span className="ml-2 text-gray-600">Loading skills and categories...</span>
        </div>
      )}

      {/* Categories Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Skill Categories</h3>
        
        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : Array.isArray(categories) && categories.length > 0 ? (
                categories.map(category => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{category.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-3 justify-end">
                        <button
                          onClick={() => {
                            setCategoryFormData({
                              name: category.name,
                              description: category.description
                            });
                            setEditingCategory(category);
                            setIsAddingCategory(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No categories available. Add your first category!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skills Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Skills</h2>
          <button
            onClick={() => fetchSkills(true)}
            disabled={skillsLoading}
            className="flex items-center px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors"
          >
            {skillsLoading ? (
              <>
                <span className="mr-2 h-4 w-4 border-2 border-t-blue-600 border-r-blue-600 border-b-transparent border-l-transparent rounded-full animate-spin"></span>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Skills
              </>
            )}
          </button>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-4">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search skills..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaTags className="text-gray-400" />
                </div>
                <select
                  id="category-filter"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {Array.isArray(categories) && categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSkills.length > 0 ? (
                filteredSkills.map((skill) => (
                  <tr key={skill.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                        <div className="text-sm text-gray-500">{skill.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {skill.category_name || getCategoryName(skill.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        skill.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        skill.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        skill.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {skill.difficulty.charAt(0).toUpperCase() + skill.difficulty.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingSkill(skill)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm || selectedCategory || selectedDifficulty 
                      ? 'No skills found matching your criteria' 
                      : 'No skills available. Add your first skill!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Skill Modal */}
      {(isAddingSkill || editingSkill) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingSkill ? 'Edit Skill' : 'Add New Skill'}
            </h3>
            
            <form onSubmit={handleSkillSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a Category</option>
                  {Array.isArray(categories) && categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingSkill(false);
                    setEditingSkill(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {editingSkill ? 'Update Skill' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <form onSubmit={handleCategorySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={categoryFormData.description}
                  onChange={handleCategoryInputChange}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setEditingCategory(null);
                    setCategoryFormData({ name: '', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to get category name from ID
  function getCategoryName(categoryId: string): string {
    if (!categoryId) return 'Uncategorized';
    const category = Array.isArray(categories) ? categories.find(cat => cat.id === categoryId) : undefined;
    return category ? category.name : 'Uncategorized';
  }
};

export default SkillManagement; 