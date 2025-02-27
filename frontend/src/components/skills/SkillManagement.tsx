import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTags, FaFilter } from 'react-icons/fa';

// Types
interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface SkillCategory {
  id: string;
  name: string;
  description: string;
}

interface SkillManagementProps {
  onCreateSkill?: (skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateSkill?: (id: string, skill: Partial<Skill>) => Promise<void>;
  onDeleteSkill?: (id: string) => Promise<void>;
  onCreateCategory?: (category: Omit<SkillCategory, 'id'>) => Promise<void>;
}

const SkillManagement: React.FC<SkillManagementProps> = ({
  onCreateSkill,
  onUpdateSkill,
  onDeleteSkill,
  onCreateCategory
}) => {
  // Sample data - in a real app, this would come from an API
  const [skills, setSkills] = useState<Skill[]>([
    {
      id: '1',
      name: 'JavaScript Fundamentals',
      description: 'Core JavaScript concepts including variables, functions, and basic DOM manipulation',
      category: 'Programming',
      difficulty: 'beginner',
      tags: ['frontend', 'web development', 'essential'],
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2023-01-15T00:00:00Z'
    },
    {
      id: '2',
      name: 'React Component Architecture',
      description: 'Understanding React component lifecycle, props, state, and hooks',
      category: 'Programming',
      difficulty: 'intermediate',
      tags: ['frontend', 'react', 'ui'],
      createdAt: '2023-01-20T00:00:00Z',
      updatedAt: '2023-02-10T00:00:00Z'
    },
    {
      id: '3',
      name: 'SQL Query Optimization',
      description: 'Advanced techniques for optimizing database queries',
      category: 'Database',
      difficulty: 'advanced',
      tags: ['backend', 'database', 'performance'],
      createdAt: '2023-02-05T00:00:00Z',
      updatedAt: '2023-02-05T00:00:00Z'
    }
  ]);

  const [categories, setCategories] = useState<SkillCategory[]>([
    { id: '1', name: 'Programming', description: 'Software development skills' },
    { id: '2', name: 'Database', description: 'Database design and query skills' },
    { id: '3', name: 'DevOps', description: 'Deployment and infrastructure skills' },
    { id: '4', name: 'Soft Skills', description: 'Communication and teamwork' }
  ]);

  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  // State for form
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: 'beginner' as Skill['difficulty'],
    tags: ''
  });

  // Category form state
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  });

  // Reset form when closing
  useEffect(() => {
    if (!isAddingSkill && !editingSkill) {
      setFormData({
        name: '',
        description: '',
        category: '',
        difficulty: 'beginner',
        tags: ''
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
        tags: editingSkill.tags.join(', ')
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
  const handleSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const skillData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      difficulty: formData.difficulty,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };

    if (editingSkill) {
      // Update existing skill
      if (onUpdateSkill) {
        onUpdateSkill(editingSkill.id, skillData);
      }
      
      // For demo purposes, update local state
      setSkills(skills.map(skill => 
        skill.id === editingSkill.id 
          ? { 
              ...skill, 
              ...skillData, 
              updatedAt: new Date().toISOString() 
            } 
          : skill
      ));
      
      setEditingSkill(null);
    } else {
      // Create new skill
      if (onCreateSkill) {
        onCreateSkill(skillData);
      }
      
      // For demo purposes, add to local state
      const newSkill: Skill = {
        id: Date.now().toString(),
        ...skillData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setSkills([...skills, newSkill]);
    }
    
    setIsAddingSkill(false);
  };

  // Handle category submission
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onCreateCategory) {
      onCreateCategory(categoryFormData);
    }
    
    // For demo purposes, add to local state
    const newCategory: SkillCategory = {
      id: Date.now().toString(),
      ...categoryFormData
    };
    
    setCategories([...categories, newCategory]);
    setIsAddingCategory(false);
    setCategoryFormData({ name: '', description: '' });
  };

  // Handle skill deletion
  const handleDeleteSkill = (id: string) => {
    if (onDeleteSkill) {
      onDeleteSkill(id);
    }
    
    // For demo purposes, remove from local state
    setSkills(skills.filter(skill => skill.id !== id));
  };

  // Filter skills based on search and filters
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory ? skill.category === selectedCategory : true;
    const matchesDifficulty = selectedDifficulty ? skill.difficulty === selectedDifficulty : true;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="bg-white rounded-lg shadow-soft p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Skill Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center px-4 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors"
          >
            <FaTags className="mr-2" />
            Add Category
          </button>
          <button
            onClick={() => setIsAddingSkill(true)}
            className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            <FaPlus className="mr-2" />
            Add Skill
          </button>
        </div>
      </div>

      {/* Search and Filters */}
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
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
                Tags
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
                      {skill.category}
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {skill.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
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
                  No skills found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
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
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g. frontend, javascript, react"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
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
            <h3 className="text-xl font-bold mb-4">Add New Category</h3>
            
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
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillManagement; 