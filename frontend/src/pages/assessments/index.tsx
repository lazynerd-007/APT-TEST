import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  Flex, 
  Grid, 
  Badge, 
  Input, 
  Select, 
  Spinner, 
  useToast,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip
} from '@chakra-ui/react';
import { 
  FaGraduationCap, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaEye
} from 'react-icons/fa';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import assessmentsService, { Assessment } from '@/services/assessmentsService';
import skillsService, { Skill } from '@/services/skillsService';

const AssessmentsPage: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assessmentsData, skillsData] = await Promise.all([
          assessmentsService.getAssessments(),
          skillsService.getSkills()
        ]);
        setAssessments(assessmentsData.results || assessmentsData);
        setSkills(skillsData.results || skillsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error fetching data',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const handleSkillFilterChange = async (skillId: string) => {
    try {
      setLoading(true);
      setSelectedSkill(skillId);
      
      let filteredAssessments;
      if (skillId) {
        filteredAssessments = await assessmentsService.getAssessmentsBySkill(skillId);
      } else {
        filteredAssessments = await assessmentsService.getAssessments();
      }
      
      setAssessments(filteredAssessments.results || filteredAssessments);
    } catch (error) {
      console.error('Error filtering assessments:', error);
      toast({
        title: 'Error filtering assessments',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredAssessments = assessments.filter(assessment => 
    assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleCreateAssessment = () => {
    router.push('/assessments/create');
  };
  
  const handleViewAssessment = (id: string) => {
    router.push(`/assessments/${id}`);
  };
  
  const handleEditAssessment = (id: string) => {
    router.push(`/assessments/${id}/edit`);
  };
  
  const handleDeleteAssessment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await assessmentsService.deleteAssessment(id);
        setAssessments(assessments.filter(assessment => assessment.id !== id));
        toast({
          title: 'Assessment deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error deleting assessment:', error);
        toast({
          title: 'Error deleting assessment',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };
  
  return (
    <DashboardLayout>
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg" mb={2}>
              <Flex align="center">
                <FaGraduationCap size={24} style={{ marginRight: '10px' }} />
                Assessments
              </Flex>
            </Heading>
            <Text color="gray.600">
              Create and manage assessments for evaluating candidates
            </Text>
          </Box>
          <Button 
            leftIcon={<FaPlus />} 
            colorScheme="blue" 
            onClick={handleCreateAssessment}
          >
            Create Assessment
          </Button>
        </Flex>
        
        <Flex mb={6} gap={4} direction={{ base: 'column', md: 'row' }}>
          <Box flex="1">
            <Flex position="relative">
              <Input
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={handleSearch}
                pr="40px"
              />
              <Box position="absolute" right="12px" top="50%" transform="translateY(-50%)">
                <FaSearch color="gray" />
              </Box>
            </Flex>
          </Box>
          <Box width={{ base: '100%', md: '300px' }}>
            <Flex align="center">
              <FaFilter color="gray" style={{ marginRight: '8px' }} />
              <Select 
                placeholder="Filter by skill" 
                value={selectedSkill}
                onChange={(e) => handleSkillFilterChange(e.target.value)}
              >
                <option value="">All Skills</option>
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </Select>
            </Flex>
          </Box>
        </Flex>
        
        {loading ? (
          <Flex justify="center" align="center" height="200px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : filteredAssessments.length === 0 ? (
          <Box 
            p={8} 
            textAlign="center" 
            borderWidth={1} 
            borderRadius="md" 
            borderStyle="dashed"
          >
            <Text fontSize="lg" mb={4}>No assessments found</Text>
            <Button 
              leftIcon={<FaPlus />} 
              colorScheme="blue" 
              onClick={handleCreateAssessment}
            >
              Create your first assessment
            </Button>
          </Box>
        ) : (
          <Grid 
            templateColumns={{ 
              base: "1fr", 
              md: "repeat(2, 1fr)", 
              lg: "repeat(3, 1fr)" 
            }}
            gap={6}
          >
            {filteredAssessments.map(assessment => (
              <Box 
                key={assessment.id} 
                borderWidth={1} 
                borderRadius="md" 
                overflow="hidden" 
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ boxShadow: "md" }}
              >
                <Box p={4} bg="gray.50">
                  <Flex justify="space-between" align="center">
                    <Heading size="md" isTruncated title={assessment.title}>
                      {assessment.title}
                    </Heading>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FaEllipsisV />}
                        variant="ghost"
                        size="sm"
                        aria-label="Options"
                      />
                      <MenuList>
                        <MenuItem 
                          icon={<FaEye />} 
                          onClick={() => handleViewAssessment(assessment.id)}
                        >
                          View
                        </MenuItem>
                        <MenuItem 
                          icon={<FaEdit />} 
                          onClick={() => handleEditAssessment(assessment.id)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem 
                          icon={<FaTrash />} 
                          onClick={() => handleDeleteAssessment(assessment.id)}
                          color="red.500"
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>
                </Box>
                
                <Box p={4}>
                  <Text noOfLines={2} mb={3} color="gray.600">
                    {assessment.description}
                  </Text>
                  
                  <Flex mb={3}>
                    <Tooltip label="Time limit">
                      <Badge colorScheme="blue" mr={2}>
                        {assessment.time_limit} min
                      </Badge>
                    </Tooltip>
                    <Tooltip label="Passing score">
                      <Badge colorScheme="green">
                        {assessment.passing_score}%
                      </Badge>
                    </Tooltip>
                  </Flex>
                  
                  <Text fontSize="sm" fontWeight="bold" mb={2}>
                    Skills:
                  </Text>
                  <Flex flexWrap="wrap" gap={2}>
                    {assessment.assessment_skills?.length > 0 ? (
                      assessment.assessment_skills.map(assessmentSkill => (
                        <Badge 
                          key={assessmentSkill.id} 
                          colorScheme={
                            assessmentSkill.importance === 'primary' ? 'red' :
                            assessmentSkill.importance === 'secondary' ? 'purple' : 'teal'
                          }
                          variant="subtle"
                          px={2}
                          py={1}
                          borderRadius="full"
                        >
                          {assessmentSkill.skill_details.name}
                        </Badge>
                      ))
                    ) : (
                      <Text fontSize="sm" color="gray.500">No skills assigned</Text>
                    )}
                  </Flex>
                </Box>
                
                <Box p={4} borderTopWidth={1}>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="gray.500">
                      {assessment.assessment_tests?.length || 0} tests
                    </Text>
                    <Button 
                      size="sm" 
                      onClick={() => handleViewAssessment(assessment.id)}
                      colorScheme="blue"
                      variant="outline"
                    >
                      View Details
                    </Button>
                  </Flex>
                </Box>
              </Box>
            ))}
          </Grid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default AssessmentsPage; 