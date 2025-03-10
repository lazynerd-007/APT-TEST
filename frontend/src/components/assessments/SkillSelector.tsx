import React, { useState, useEffect } from 'react';
import { FaSearch, FaTags, FaPlus, FaTimes } from 'react-icons/fa';
import skillsService, { Skill, SkillCategory } from '../../services/skillsService';

interface SkillSelectorProps {
  selectedSkills: string[];
  onChange: (skillIds: string[]) => void;
  maxSkills?: number;
  required?: boolean;
}

const SkillSelector: React.FC<SkillSelectorProps> = ({
  selectedSkills = [],
  onChange,
  maxSkills = 10,
  required = false
}) => {
  // State for skills and categories
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  
  // State for selected skills
  const [selectedSkillObjects, setSelectedSkillObjects] = useState<Skill[]>([]);

  // Fetch skills and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch skills and categories separately to better handle errors
        try {
          console.log('Fetching skills...');
          const skillsData = await skillsService.getSkills();
          // Ensure skills is always an array
          setSkills(Array.isArray(skillsData) ? skillsData : []);
        } catch (skillError) {
          console.error('Error fetching skills:', skillError);
          setError('Failed to load skills. Please try again later.');
          setSkills([]);
        }
        
        try {
          console.log('Fetching categories...');
          const categoriesData = await skillsService.getCategories();
          // Ensure categories is always an array
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (categoryError) {
          console.error('Error fetching skill categories:', categoryError);
          setError('Failed to load skill categories. Please try again later.');
          setCategories([]);
        }
        
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Failed to load skills and categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update selected skill objects when selectedSkills prop changes
  useEffect(() => {
    if (skills.length > 0 && selectedSkills.length > 0) {
      const skillObjects = skills.filter(skill => selectedSkills.includes(skill.id));
      setSelectedSkillObjects(skillObjects);
    } else {
      setSelectedSkillObjects([]);
    }
  }, [selectedSkills, skills]);

  // Filter skills based on search and filters
  const filteredSkills = skills.filter(skill => {
    // Don't show already selected skills
    if (selectedSkills.includes(skill.id)) {
      return false;
    }

    const matchesSearch = 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory ? skill.category === selectedCategory : true;
    const matchesDifficulty = selectedDifficulty ? skill.difficulty === selectedDifficulty : true;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Handle skill selection
  const handleSelectSkill = (skill: Skill) => {
    if (selectedSkills.length >= maxSkills) {
      setError(`You can select a maximum of ${maxSkills} skills`);
      return;
    }

    const newSelectedSkills = [...selectedSkills, skill.id];
    onChange(newSelectedSkills);
    setSelectedSkillObjects([...selectedSkillObjects, skill]);
    setError(null);
  };

  // Handle skill removal
  const handleRemoveSkill = (skillId: string) => {
    const newSelectedSkills = selectedSkills.filter(id => id !== skillId);
    onChange(newSelectedSkills);
    setSelectedSkillObjects(selectedSkillObjects.filter(skill => skill.id !== skillId));
  };

  // Get category name from ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-soft p-4 flex justify-center items-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-soft p-4">
      {/* Selected Skills */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selected Skills {required && <span className="text-danger-500">*</span>}
        </label>
        
        {selectedSkillObjects.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[60px]">
            {selectedSkillObjects.map(skill => (
              <div 
                key={skill.id} 
                className="flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
              >
                <span className="mr-1">{skill.name}</span>
                <button 
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-primary-600 hover:text-primary-800"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2 border border-gray-300 rounded-md min-h-[60px] flex items-center justify-center text-gray-500 text-sm">
            No skills selected. Search and add skills below.
          </div>
        )}
        
        {required && selectedSkillObjects.length === 0 && (
          <p className="mt-1 text-sm text-danger-600">At least one skill is required</p>
        )}
        
        {selectedSkillObjects.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            {selectedSkillObjects.length} of {maxSkills} skills selected
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Skills
        </label>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
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
          
          <div className="flex space-x-2">
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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

      {/* Skills List */}
      <div className="overflow-y-auto max-h-64 border border-gray-200 rounded-md">
        {filteredSkills.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredSkills.map(skill => (
              <li key={skill.id} className="p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900">{skill.name}</h4>
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        skill.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        skill.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        skill.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {skill.difficulty.charAt(0).toUpperCase() + skill.difficulty.slice(1)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{skill.description}</p>
                    <div className="mt-1">
                      <span className="text-xs text-blue-600">
                        {skill.category_name || getCategoryName(skill.category)}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {skill.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectSkill(skill)}
                    className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={selectedSkills.length >= maxSkills}
                  >
                    <FaPlus className="mr-1" />
                    Add
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500">
            {searchTerm || selectedCategory || selectedDifficulty 
              ? 'No skills found matching your criteria' 
              : 'No skills available to select'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillSelector; 