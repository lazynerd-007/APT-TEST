import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Spinner,
  Progress,
  Badge,
  Select,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useColorModeValue,
  Alert,
  AlertIcon,
  Button
} from '@chakra-ui/react';
import { FaGraduationCap, FaChartBar, FaDownload } from 'react-icons/fa';
import assessmentsService, { CandidateSkillScore } from '@/services/assessmentsService';
import skillsService from '@/services/skillsService';
import jsPDF from 'jspdf';

interface CandidateSkillProfileProps {
  candidateId: string;
}

const CandidateSkillProfile: React.FC<CandidateSkillProfileProps> = ({ candidateId }) => {
  const [skillScores, setSkillScores] = useState<CandidateSkillScore[]>([]);
  const [assessmentOptions, setAssessmentOptions] = useState<{ id: string; title: string }[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all candidate assessments
        const candidateAssessments = await assessmentsService.getCandidateAssessments({
          candidate: candidateId
        });
        
        // Extract assessment options
        const assessments = candidateAssessments.results || candidateAssessments;
        const options = assessments.map((assessment: any) => ({
          id: assessment.assessment,
          title: assessment.assessment_details.title
        }));
        setAssessmentOptions(options);
        
        // Fetch all skill scores for the candidate
        let allSkillScores: CandidateSkillScore[] = [];
        
        for (const assessment of assessments) {
          if (assessment.status === 'completed') {
            const scores = await assessmentsService.getCandidateSkillScores(assessment.id);
            allSkillScores = [...allSkillScores, ...scores];
          }
        }
        
        setSkillScores(allSkillScores);
      } catch (error) {
        console.error('Error fetching candidate skill data:', error);
        setError('Failed to load skill profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (candidateId) {
      fetchData();
    }
  }, [candidateId]);
  
  const handleAssessmentChange = async (assessmentId: string) => {
    setSelectedAssessment(assessmentId);
    
    try {
      setLoading(true);
      
      if (assessmentId === 'all') {
        // Reload all skill scores
        const candidateAssessments = await assessmentsService.getCandidateAssessments({
          candidate: candidateId
        });
        
        const assessments = candidateAssessments.results || candidateAssessments;
        let allSkillScores: CandidateSkillScore[] = [];
        
        for (const assessment of assessments) {
          if (assessment.status === 'completed') {
            const scores = await assessmentsService.getCandidateSkillScores(assessment.id);
            allSkillScores = [...allSkillScores, ...scores];
          }
        }
        
        setSkillScores(allSkillScores);
      } else {
        // Filter to specific assessment
        const filteredScores = await assessmentsService.getCandidateSkillScores(assessmentId);
        setSkillScores(filteredScores);
      }
    } catch (error) {
      console.error('Error filtering skill scores:', error);
      setError('Failed to filter skill scores. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Group skills by category
  const groupedSkills: Record<string, CandidateSkillScore[]> = {};
  skillScores.forEach(score => {
    const category = score.skill_details.category.name;
    if (!groupedSkills[category]) {
      groupedSkills[category] = [];
    }
    groupedSkills[category].push(score);
  });
  
  // Calculate average score
  const averageScore = skillScores.length > 0
    ? skillScores.reduce((sum, score) => sum + score.score, 0) / skillScores.length
    : 0;
  
  // Find top and bottom skills
  const sortedSkills = [...skillScores].sort((a, b) => b.score - a.score);
  const topSkills = sortedSkills.slice(0, 3);
  const bottomSkills = sortedSkills.slice(-3).reverse();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'yellow';
    return 'red';
  };
  
  const handleExportPDF = () => {
    if (!skillScores) return;
    
    // Create a new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 128);
    doc.text('Candidate Skill Profile', pageWidth / 2, 20, { align: 'center' });
    
    // Add skill scores
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 128);
    doc.text('Skill Assessment Scores', 20, 40);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 50;
    skillScores.forEach((skill, index) => {
      // Skip if we're about to go off the page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        
        // Add header to new page
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 128);
        doc.text('Skill Assessment Scores (continued)', 20, yPosition);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        yPosition += 10;
      }
      
      // Draw skill name and score
      doc.text(`${skill.skill_details.name}:`, 20, yPosition);
      doc.text(`${skill.score}%`, 150, yPosition);
      
      // Draw score bar
      const barWidth = skill.score;
      doc.setFillColor(getScoreColorRGB(skill.score));
      doc.rect(20, yPosition + 2, barWidth, 5, 'F');
      
      yPosition += 15;
    });
    
    // Add strengths and areas for improvement
    if (topSkills.length > 0 || bottomSkills.length > 0) {
      // Check if we need a new page
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
      }
      
      if (topSkills.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 128);
        doc.text('Key Strengths', 20, yPosition);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        yPosition += 10;
        
        topSkills.forEach(skill => {
          doc.text(`• ${skill.skill_details.name}`, 25, yPosition);
          yPosition += 10;
        });
        
        yPosition += 5;
      }
      
      if (bottomSkills.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 128);
        doc.text('Areas for Improvement', 20, yPosition);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        yPosition += 10;
        
        bottomSkills.forEach(skill => {
          doc.text(`• ${skill.skill_details.name}`, 25, yPosition);
          yPosition += 10;
        });
      }
    }
    
    // Add footer with date
    const today = new Date();
    const dateStr = today.toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${dateStr} by BLUAPT Skills Assessment Platform`, pageWidth / 2, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`${candidateId}_Skill_Profile.pdf`);
  };
  
  // Helper function to get RGB color values for PDF
  const getScoreColorRGB = (score: number) => {
    if (score >= 80) return [46, 204, 113]; // green
    if (score >= 60) return [52, 152, 219]; // blue
    if (score >= 40) return [241, 196, 15]; // yellow
    return [231, 76, 60]; // red
  };
  
  if (loading) {
    return (
      <Flex justify="center" align="center" height="300px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }
  
  if (skillScores.length === 0) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        No skill data available for this candidate. They need to complete assessments to generate skill scores.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">
          <Flex align="center">
            <FaGraduationCap style={{ marginRight: '8px' }} />
            Skill Profile
          </Flex>
        </Heading>
        <Flex align="center">
          <Select 
            value={selectedAssessment} 
            onChange={(e) => handleAssessmentChange(e.target.value)}
            width="250px"
            mr={3}
          >
            <option value="all">All Assessments</option>
            {assessmentOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </Select>
          <Button 
            leftIcon={<FaDownload />} 
            size="sm" 
            onClick={handleExportPDF}
            colorScheme="blue"
            variant="outline"
          >
            Export
          </Button>
        </Flex>
      </Flex>
      
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6} mb={8}>
        <GridItem>
          <Stat
            p={4}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            boxShadow="sm"
          >
            <StatLabel fontSize="sm" color="gray.500">Average Skill Score</StatLabel>
            <StatNumber fontSize="2xl" color={getScoreColor(averageScore)}>
              {averageScore.toFixed(1)}%
            </StatNumber>
            <StatHelpText>
              Based on {skillScores.length} skills
            </StatHelpText>
          </Stat>
        </GridItem>
        
        <GridItem>
          <Stat
            p={4}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            boxShadow="sm"
          >
            <StatLabel fontSize="sm" color="gray.500">Top Skill</StatLabel>
            {topSkills.length > 0 ? (
              <>
                <StatNumber fontSize="xl" isTruncated>
                  {topSkills[0].skill_details.name}
                </StatNumber>
                <StatHelpText>
                  <Badge colorScheme={getScoreColor(topSkills[0].score)}>
                    {topSkills[0].score.toFixed(1)}%
                  </Badge>
                </StatHelpText>
              </>
            ) : (
              <StatNumber fontSize="md" color="gray.400">No data</StatNumber>
            )}
          </Stat>
        </GridItem>
        
        <GridItem>
          <Stat
            p={4}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            boxShadow="sm"
          >
            <StatLabel fontSize="sm" color="gray.500">Skill Categories</StatLabel>
            <StatNumber fontSize="2xl">
              {Object.keys(groupedSkills).length}
            </StatNumber>
            <StatHelpText>
              {Object.keys(groupedSkills).slice(0, 2).join(', ')}
              {Object.keys(groupedSkills).length > 2 ? '...' : ''}
            </StatHelpText>
          </Stat>
        </GridItem>
      </Grid>
      
      <Box 
        mb={8} 
        p={4} 
        bg={bgColor} 
        borderWidth="1px" 
        borderColor={borderColor} 
        borderRadius="md"
        boxShadow="sm"
      >
        <Flex align="center" mb={4}>
          <FaChartBar style={{ marginRight: '8px' }} />
          <Heading size="sm">Skill Breakdown</Heading>
        </Flex>
        
        <Divider mb={4} />
        
        {Object.entries(groupedSkills).map(([category, skills]) => (
          <Box key={category} mb={6}>
            <Text fontWeight="bold" mb={2}>{category}</Text>
            
            {skills.map(skill => (
              <Box key={skill.id} mb={3}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm">{skill.skill_details.name}</Text>
                  <Badge colorScheme={getScoreColor(skill.score)}>
                    {skill.score.toFixed(1)}%
                  </Badge>
                </Flex>
                <Progress 
                  value={skill.score} 
                  colorScheme={getScoreColor(skill.score)} 
                  size="sm" 
                  borderRadius="full"
                />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
      
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
        <GridItem>
          <Box 
            p={4} 
            bg={bgColor} 
            borderWidth="1px" 
            borderColor={borderColor} 
            borderRadius="md"
            boxShadow="sm"
          >
            <Heading size="sm" mb={4}>Strongest Skills</Heading>
            
            {topSkills.map(skill => (
              <Flex 
                key={skill.id} 
                justify="space-between" 
                align="center" 
                mb={3} 
                p={2}
                borderRadius="md"
                bg={useColorModeValue('gray.50', 'gray.700')}
              >
                <Box>
                  <Text fontWeight="medium">{skill.skill_details.name}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {skill.skill_details.category.name}
                  </Text>
                </Box>
                <Badge colorScheme={getScoreColor(skill.score)} fontSize="sm" px={2} py={1}>
                  {skill.score.toFixed(1)}%
                </Badge>
              </Flex>
            ))}
          </Box>
        </GridItem>
        
        <GridItem>
          <Box 
            p={4} 
            bg={bgColor} 
            borderWidth="1px" 
            borderColor={borderColor} 
            borderRadius="md"
            boxShadow="sm"
          >
            <Heading size="sm" mb={4}>Areas for Improvement</Heading>
            
            {bottomSkills.map(skill => (
              <Flex 
                key={skill.id} 
                justify="space-between" 
                align="center" 
                mb={3} 
                p={2}
                borderRadius="md"
                bg={useColorModeValue('gray.50', 'gray.700')}
              >
                <Box>
                  <Text fontWeight="medium">{skill.skill_details.name}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {skill.skill_details.category.name}
                  </Text>
                </Box>
                <Badge colorScheme={getScoreColor(skill.score)} fontSize="sm" px={2} py={1}>
                  {skill.score.toFixed(1)}%
                </Badge>
              </Flex>
            ))}
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default CandidateSkillProfile; 